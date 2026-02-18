/**
 * Database Module
 *
 * Manages SQLite database at /Users/Shared/TrainDaily/workouts.db
 * Shared across all macOS user accounts (system-wide storage)
 */

use anyhow::{Context, Result};
use rusqlite::{Connection, params};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// Shared data directory (accessible by all macOS users)
const SHARED_DATA_DIR: &str = "/Users/Shared/TrainDaily";
const DB_FILE: &str = "workouts.db";
const DEVICE_ID_FILE: &str = "device_id.txt";

// Session is stored as a JSON blob — schema-agnostic, works with any exercise keys
pub type WorkoutSession = JsonValue;

pub struct Database {
    conn: Connection,
}

impl Database {
    /// Initialize database (creates directory if needed)
    pub fn new() -> Result<Self> {
        // Create shared data directory
        let data_dir = PathBuf::from(SHARED_DATA_DIR);
        if !data_dir.exists() {
            fs::create_dir_all(&data_dir)
                .context("Failed to create shared data directory")?;

            // Set permissions to be readable/writable by all users
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let perms = fs::Permissions::from_mode(0o777);
                fs::set_permissions(&data_dir, perms)?;
            }
        }

        // Open database
        let db_path = data_dir.join(DB_FILE);
        let conn = Connection::open(&db_path)
            .context("Failed to open database")?;

        // Check if old schema exists (has 'pushup' column) and migrate
        let has_old_schema: bool = conn.query_row(
            "SELECT COUNT(*) FROM pragma_table_info('sessions') WHERE name='pushup'",
            [],
            |row| row.get::<_, i64>(0),
        ).map(|c| c > 0).unwrap_or(false);

        if has_old_schema {
            // Old schema uses named columns per exercise — drop and recreate with JSON blob schema.
            // Exercise data from old schema is sacrificed; it can be re-synced from the PWA.
            conn.execute_batch(
                "DROP TABLE IF EXISTS sessions;
                 CREATE TABLE sessions (
                     date_key TEXT PRIMARY KEY,
                     session_data TEXT NOT NULL DEFAULT '{}'
                 );"
            ).context("Failed to migrate sessions table")?;

            tracing::info!("Migrated sessions table from old column-based schema to JSON blob schema");
        } else {
            // Create new schema if it doesn't exist yet
            conn.execute(
                "CREATE TABLE IF NOT EXISTS sessions (
                    date_key TEXT PRIMARY KEY,
                    session_data TEXT NOT NULL DEFAULT '{}'
                )",
                [],
            )?;
        }

        conn.execute(
            "CREATE TABLE IF NOT EXISTS metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Self { conn })
    }

    /// Get or generate device ID (persists forever)
    pub fn get_device_id(&self) -> Result<String> {
        let device_id_path = PathBuf::from(SHARED_DATA_DIR).join(DEVICE_ID_FILE);

        if device_id_path.exists() {
            // Read existing device ID
            fs::read_to_string(&device_id_path)
                .context("Failed to read device ID")
        } else {
            // Generate new device ID
            let hostname = hostname::get()
                .ok()
                .and_then(|h| h.into_string().ok())
                .unwrap_or_else(|| "macbook".to_string());

            let random_suffix: String = (0..6)
                .map(|_| format!("{:x}", rand::random::<u8>()))
                .collect::<Vec<_>>()
                .join("");

            let device_id = format!("{}-{}", hostname.to_lowercase(), random_suffix);

            // Save to file
            fs::write(&device_id_path, &device_id)
                .context("Failed to write device ID")?;

            Ok(device_id)
        }
    }

    /// Get all workout sessions
    pub fn get_all_sessions(&self) -> Result<HashMap<String, WorkoutSession>> {
        let mut stmt = self.conn.prepare(
            "SELECT date_key, session_data FROM sessions"
        )?;

        let sessions = stmt.query_map([], |row| {
            let date_key: String = row.get(0)?;
            let session_data: String = row.get(1)?;
            Ok((date_key, session_data))
        })?;

        let mut map = HashMap::new();
        for session in sessions {
            let (key, json_str) = session?;
            if let Ok(value) = serde_json::from_str::<JsonValue>(&json_str) {
                map.insert(key, value);
            }
        }

        Ok(map)
    }

    /// Save a workout session
    pub fn save_session(&self, date_key: &str, session: &WorkoutSession) -> Result<()> {
        let session_data = serde_json::to_string(session)
            .unwrap_or_else(|_| "{}".to_string());

        self.conn.execute(
            "INSERT OR REPLACE INTO sessions (date_key, session_data) VALUES (?1, ?2)",
            params![date_key, session_data],
        )?;

        Ok(())
    }

    /// Get first session date (for week number calculation)
    pub fn get_first_session_date(&self) -> Result<Option<String>> {
        let result: Option<String> = self.conn.query_row(
            "SELECT value FROM metadata WHERE key = 'first_session_date'",
            [],
            |row| row.get(0),
        ).ok();

        Ok(result)
    }

    /// Set first session date (called once)
    pub fn set_first_session_date(&self, date_key: &str) -> Result<()> {
        // Only set if not already exists
        if self.get_first_session_date()?.is_none() {
            self.conn.execute(
                "INSERT INTO metadata (key, value) VALUES ('first_session_date', ?1)",
                params![date_key],
            )?;
        }
        Ok(())
    }

    /// Get a generic setting from metadata table
    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let result: Option<String> = self.conn.query_row(
            "SELECT value FROM metadata WHERE key = ?1",
            params![key],
            |row| row.get(0),
        ).ok();
        Ok(result)
    }

    /// Set a generic setting in metadata table
    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO metadata (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_database_init() {
        let db = Database::new().unwrap();
        let device_id = db.get_device_id().unwrap();
        assert!(!device_id.is_empty());
    }

    #[test]
    fn test_save_and_retrieve_session() {
        let db = Database::new().unwrap();

        let session = json!({
            "trx_pushup": [10, 8],
            "pike_pushup": [12, 10],
            "logged_at": "2026-02-17T10:00:00Z",
            "week_number": 1
        });

        db.save_session("2026-02-17", &session).unwrap();

        let sessions = db.get_all_sessions().unwrap();
        assert!(sessions.len() >= 1);

        let retrieved = sessions.get("2026-02-17").unwrap();
        assert_eq!(retrieved["trx_pushup"], json!([10, 8]));
        assert_eq!(retrieved["week_number"], json!(1));
    }
}
