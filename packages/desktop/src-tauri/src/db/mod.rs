/**
 * Database Module
 *
 * Manages SQLite database at /Users/Shared/TrainDaily/workouts.db
 * Shared across all macOS user accounts (system-wide storage)
 */

use anyhow::{Context, Result};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// Shared data directory (accessible by all macOS users)
const SHARED_DATA_DIR: &str = "/Users/Shared/TrainDaily";
const DB_FILE: &str = "workouts.db";
const DEVICE_ID_FILE: &str = "device_id.txt";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutSession {
    pub inverted_row: Option<Vec<i32>>,
    pub single_arm_row: Option<Vec<i32>>,
    pub pike_pushup: Option<Vec<i32>>,
    pub face_pull: Option<Vec<i32>>,
    pub pushup: Option<Vec<i32>>,
    pub wall_lateral_raise: Option<Vec<i32>>,
    pub plank: Option<Vec<i32>>,
    pub logged_at: String,
    pub week_number: i32,
}

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

        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sessions (
                date_key TEXT PRIMARY KEY,
                inverted_row TEXT,
                single_arm_row TEXT,
                pike_pushup TEXT,
                face_pull TEXT,
                pushup TEXT,
                wall_lateral_raise TEXT,
                plank TEXT,
                logged_at TEXT NOT NULL,
                week_number INTEGER NOT NULL
            )",
            [],
        )?;

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
            "SELECT date_key, inverted_row, single_arm_row, pike_pushup, face_pull,
                    pushup, wall_lateral_raise, plank, logged_at, week_number
             FROM sessions"
        )?;

        let sessions = stmt.query_map([], |row| {
            let date_key: String = row.get(0)?;

            let session = WorkoutSession {
                inverted_row: Self::parse_json_array(row.get(1)?),
                single_arm_row: Self::parse_json_array(row.get(2)?),
                pike_pushup: Self::parse_json_array(row.get(3)?),
                face_pull: Self::parse_json_array(row.get(4)?),
                pushup: Self::parse_json_array(row.get(5)?),
                wall_lateral_raise: Self::parse_json_array(row.get(6)?),
                plank: Self::parse_json_array(row.get(7)?),
                logged_at: row.get(8)?,
                week_number: row.get(9)?,
            };

            Ok((date_key, session))
        })?;

        let mut map = HashMap::new();
        for session in sessions {
            let (key, value) = session?;
            map.insert(key, value);
        }

        Ok(map)
    }

    /// Save a workout session
    pub fn save_session(&self, date_key: &str, session: &WorkoutSession) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO sessions
             (date_key, inverted_row, single_arm_row, pike_pushup, face_pull,
              pushup, wall_lateral_raise, plank, logged_at, week_number)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                date_key,
                Self::serialize_array(&session.inverted_row),
                Self::serialize_array(&session.single_arm_row),
                Self::serialize_array(&session.pike_pushup),
                Self::serialize_array(&session.face_pull),
                Self::serialize_array(&session.pushup),
                Self::serialize_array(&session.wall_lateral_raise),
                Self::serialize_array(&session.plank),
                &session.logged_at,
                session.week_number,
            ],
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

    // Helper: Parse JSON array from SQLite TEXT field
    fn parse_json_array(value: Option<String>) -> Option<Vec<i32>> {
        value.and_then(|s| serde_json::from_str(&s).ok())
    }

    // Helper: Serialize array to JSON string
    fn serialize_array(value: &Option<Vec<i32>>) -> Option<String> {
        value.as_ref().and_then(|v| serde_json::to_string(v).ok())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_init() {
        let db = Database::new().unwrap();
        let device_id = db.get_device_id().unwrap();
        assert!(!device_id.is_empty());
    }

    #[test]
    fn test_save_and_retrieve_session() {
        let db = Database::new().unwrap();

        let session = WorkoutSession {
            pushup: Some(vec![10, 8]),
            plank: Some(vec![20, 15]),
            inverted_row: None,
            single_arm_row: None,
            pike_pushup: None,
            face_pull: None,
            wall_lateral_raise: None,
            logged_at: "2026-02-17T10:00:00Z".to_string(),
            week_number: 1,
        };

        db.save_session("2026-02-17", &session).unwrap();

        let sessions = db.get_all_sessions().unwrap();
        assert_eq!(sessions.len(), 1);

        let retrieved = sessions.get("2026-02-17").unwrap();
        assert_eq!(retrieved.pushup, Some(vec![10, 8]));
        assert_eq!(retrieved.week_number, 1);
    }
}
