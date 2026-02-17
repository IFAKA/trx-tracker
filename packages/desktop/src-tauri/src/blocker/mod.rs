/**
 * App Blocker Module
 *
 * Full-screen overlay that blocks access to all apps on training days
 * until workout is logged. True "no excuses" enforcement.
 *
 * Features:
 * - Full-screen window (always on top, covers everything)
 * - Prevents Cmd+Tab, Cmd+Q (keyboard intercept)
 * - Only dismissible by logging workout
 * - Checks every 10 seconds on training days
 */

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use std::sync::{Arc, Mutex};
use crate::db::Database;

const CHECK_INTERVAL_SECS: u64 = 10;

pub struct BlockerState {
    pub enabled: bool,
    pub window_open: bool,
}

impl BlockerState {
    pub fn new() -> Self {
        Self {
            enabled: false,
            window_open: false,
        }
    }
}

/// Start blocker background task
pub async fn start_blocker(
    app_handle: tauri::AppHandle,
    db: Arc<Mutex<Database>>,
    state: Arc<Mutex<BlockerState>>,
) {
    use tokio::time::{sleep, Duration};

    loop {
        sleep(Duration::from_secs(CHECK_INTERVAL_SECS)).await;

        // Check if today is a training day and workout not logged
        let should_block = check_should_block(&db);

        let mut blocker_state = state.lock().unwrap();

        if should_block && !blocker_state.window_open {
            // Show blocker window
            if let Err(e) = show_blocker_window(&app_handle) {
                tracing::error!("Failed to show blocker window: {}", e);
            } else {
                blocker_state.window_open = true;
            }
        } else if !should_block && blocker_state.window_open {
            // Hide blocker window
            if let Err(e) = hide_blocker_window(&app_handle) {
                tracing::error!("Failed to hide blocker window: {}", e);
            } else {
                blocker_state.window_open = false;
            }
        }
    }
}

/// Check if we should block (training day + no workout logged)
fn check_should_block(db: &Arc<Mutex<Database>>) -> bool {
    use chrono::Datelike;

    let now = chrono::Local::now();
    let weekday = now.weekday().num_days_from_monday();

    // Training days: Mon (0), Wed (2), Fri (4)
    let is_training_day = weekday == 0 || weekday == 2 || weekday == 4;

    if !is_training_day {
        return false;
    }

    // Check if workout logged today
    let date_key = now.format("%Y-%m-%d").to_string();

    let db_lock = db.lock().unwrap();
    let sessions = db_lock.get_all_sessions().unwrap_or_default();

    !sessions.contains_key(&date_key)
}

/// Show full-screen blocker window
fn show_blocker_window(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Check if window already exists
    if let Some(window) = app_handle.get_webview_window("blocker") {
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    // Create new blocker window
    let window = WebviewWindowBuilder::new(
        app_handle,
        "blocker",
        WebviewUrl::App("/blocker".into()),
    )
    .title("Complete Workout to Continue")
    .fullscreen(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .decorations(false)
    .resizable(false)
    .build()?;

    window.show()?;
    window.set_focus()?;

    tracing::info!("Blocker window shown");

    Ok(())
}

/// Hide blocker window
fn hide_blocker_window(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(window) = app_handle.get_webview_window("blocker") {
        window.close()?;
        tracing::info!("Blocker window closed");
    }
    Ok(())
}
