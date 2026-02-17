// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod cert;
mod commands;
mod mic;
mod sync;
mod blocker;
mod overlay;

use tauri::Manager;
use std::sync::{Arc, Mutex};

// Shared application state
pub struct AppState {
    pub db: Arc<Mutex<db::Database>>,
    pub device_id: String,
    pub blocker_state: Arc<Mutex<blocker::BlockerState>>,
    pub overlay_state: Arc<Mutex<overlay::OverlayState>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing (logging)
    tracing_subscriber::fmt::init();

    // Initialize database
    let db = db::Database::new().expect("Failed to initialize database");
    let device_id = db.get_device_id().expect("Failed to get device ID");

    // Create shared state
    let blocker_state = Arc::new(Mutex::new(blocker::BlockerState::new()));
    let overlay_state = Arc::new(Mutex::new(overlay::OverlayState::new()));

    // Clone Arc references before moving state into .manage()
    let db_arc = Arc::new(Mutex::new(db));
    let db_for_sync = db_arc.clone();
    let db_for_blocker = db_arc.clone();
    let device_id_for_sync = device_id.clone();
    let blocker_state_for_task = blocker_state.clone();
    let overlay_state_for_task = overlay_state.clone();

    let state = AppState {
        db: db_arc,
        device_id,
        blocker_state: blocker_state.clone(),
        overlay_state: overlay_state.clone(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_all_sessions,
            commands::save_session,
            commands::get_first_session_date,
            commands::set_first_session_date,
            commands::get_device_id,
            commands::check_mic_active,
            commands::get_qr_code_data,
            overlay::dismiss_micro_break,
        ])
        .setup(move |app| {
            let app_handle = app.handle().clone();

            // Start sync server
            let db_clone = db_for_sync.clone();
            let device_id_clone = device_id_for_sync.clone();

            tokio::spawn(async move {
                if let Err(e) = sync::start_server(db_clone, device_id_clone).await {
                    tracing::error!("Failed to start sync server: {}", e);
                }
            });

            // Start app blocker
            let db_clone = db_for_blocker.clone();
            let blocker_state_clone = blocker_state_for_task.clone();
            let app_handle_clone = app_handle.clone();

            tokio::spawn(async move {
                blocker::start_blocker(app_handle_clone, db_clone, blocker_state_clone).await;
            });

            // Start micro-break overlay
            let overlay_state_clone = overlay_state_for_task.clone();
            let app_handle_clone = app_handle.clone();

            tokio::spawn(async move {
                overlay::start_overlay(app_handle_clone, overlay_state_clone).await;
            });

            // Create system tray icon
            #[cfg(desktop)]
            {
                use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};

                let tray = TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
                    .tooltip("TrainDaily")
                    .on_tray_icon_event(|tray, event| {
                        if let tauri::tray::TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            // Show main window on tray click
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
