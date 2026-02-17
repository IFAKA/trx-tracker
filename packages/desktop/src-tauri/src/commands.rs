/**
 * Tauri Commands
 *
 * Exposed to frontend via invoke()
 */

use crate::db::{Database, WorkoutSession};
use crate::AppState;
use serde_json::Value;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub fn get_all_sessions(state: State<AppState>) -> Result<HashMap<String, WorkoutSession>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_sessions().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_session(
    date_key: String,
    session: WorkoutSession,
    state: State<AppState>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_session(&date_key, &session).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_first_session_date(state: State<AppState>) -> Result<Option<String>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_first_session_date().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_first_session_date(date_key: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.set_first_session_date(&date_key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_device_id(state: State<AppState>) -> String {
    state.device_id.clone()
}

#[tauri::command]
pub fn check_mic_active() -> bool {
    match crate::mic::is_mic_active() {
        Ok(active) => active,
        Err(e) => {
            tracing::warn!("Failed to check mic status: {}", e);
            false
        }
    }
}

#[tauri::command]
pub fn get_qr_code_data(state: State<AppState>) -> Result<String, String> {
    let local_ip = crate::sync::get_local_ip().map_err(|e| e.to_string())?;

    // Auth token would be stored in state in production
    // For now, generate a placeholder
    let auth_token = "demo-token-12345678"; // TODO: Store in state

    let qr_data = crate::sync::generate_qr_data(
        &state.device_id,
        auth_token,
        &local_ip,
    );

    Ok(qr_data)
}
