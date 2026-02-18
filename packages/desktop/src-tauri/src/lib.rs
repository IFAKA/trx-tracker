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
    pub auth_token: String,
    pub blocker_state: Arc<Mutex<blocker::BlockerState>>,
    pub overlay_state: Arc<Mutex<overlay::OverlayState>>,
    #[cfg(desktop)]
    pub tray: Mutex<Option<tauri::tray::TrayIcon>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing (logging)
    tracing_subscriber::fmt::init();

    // Initialize database
    let db = db::Database::new().expect("Failed to initialize database");
    let device_id = db.get_device_id().expect("Failed to get device ID");

    // Load or generate persistent auth token (used for QR pairing + sync server)
    let auth_token = db.get_setting("auth_token")
        .ok()
        .flatten()
        .unwrap_or_else(|| {
            let token = sync::generate_auth_token();
            let _ = db.set_setting("auth_token", &token);
            token
        });

    // Read saved tray preference before moving db into Arc
    let tray_visible = db.get_setting("tray_visible")
        .ok()
        .flatten()
        .map(|v| v != "false")
        .unwrap_or(true);

    // On first launch, enable open-at-login automatically
    let is_first_run = db.get_setting("open_at_login").ok().flatten().is_none();

    // Create shared state
    let blocker_state = Arc::new(Mutex::new(blocker::BlockerState::new()));
    let overlay_state = Arc::new(Mutex::new(overlay::OverlayState::new()));

    // Clone Arc references before moving state into .manage()
    let db_arc = Arc::new(Mutex::new(db));
    let db_for_sync = db_arc.clone();
    let db_for_blocker = db_arc.clone();
    let device_id_for_sync = device_id.clone();
    let auth_token_for_sync = auth_token.clone();
    let blocker_state_for_task = blocker_state.clone();
    let overlay_state_for_task = overlay_state.clone();

    let state = AppState {
        db: db_arc,
        device_id,
        auth_token,
        blocker_state: blocker_state.clone(),
        overlay_state: overlay_state.clone(),
        #[cfg(desktop)]
        tray: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_all_sessions,
            commands::save_session,
            commands::get_first_session_date,
            commands::set_first_session_date,
            commands::get_device_id,
            commands::check_mic_active,
            commands::get_qr_code_data,
            commands::get_setting,
            commands::set_setting,
            commands::set_tray_visible,
            commands::set_open_at_login,
            overlay::dismiss_micro_break,
        ])
        .setup(move |app| {
            let app_handle = app.handle().clone();

            // Enable open-at-login on first launch
            if is_first_run {
                use tauri_plugin_autostart::ManagerExt;
                let _ = app.autolaunch().enable();
                let state = app.state::<AppState>();
                if let Ok(db) = state.db.lock() {
                    let _ = db.set_setting("open_at_login", "true");
                };
            }

            // Start sync server
            let db_clone = db_for_sync.clone();
            let device_id_clone = device_id_for_sync.clone();
            let auth_token_clone = auth_token_for_sync.clone();

            tauri::async_runtime::spawn(async move {
                if let Err(e) = sync::start_server(db_clone, device_id_clone, auth_token_clone).await {
                    tracing::error!("Failed to start sync server: {}", e);
                }
            });

            // Start app blocker
            let db_clone = db_for_blocker.clone();
            let blocker_state_clone = blocker_state_for_task.clone();
            let app_handle_clone = app_handle.clone();

            tauri::async_runtime::spawn(async move {
                blocker::start_blocker(app_handle_clone, db_clone, blocker_state_clone).await;
            });

            // Start micro-break overlay
            let overlay_state_clone = overlay_state_for_task.clone();
            let app_handle_clone = app_handle.clone();

            tauri::async_runtime::spawn(async move {
                overlay::start_overlay(app_handle_clone, overlay_state_clone).await;
            });

            // Create system tray icon and store handle in AppState
            #[cfg(desktop)]
            {
                use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};
                use tauri::menu::{Menu, MenuItem};

                let show_item = MenuItem::with_id(app, "show", "Open TrainDaily", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quit TrainDaily", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

                let tray = TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
                    .tooltip("TrainDaily")
                    .menu(&menu)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => app.exit(0),
                        _ => {}
                    })
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

                // Apply saved tray visibility preference
                if !tray_visible {
                    let _ = tray.set_visible(false);
                }

                // Store tray handle in AppState for later toggle
                let state = app.state::<AppState>();
                *state.tray.lock().unwrap() = Some(tray);
            }

            // Run as accessory (no Dock icon, no Cmd+Tab) — tray-only app
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Hide window instead of quitting when user closes it
            let main_window = app.get_webview_window("main").unwrap();
            let main_window_clone = main_window.clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = main_window_clone.hide();
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, _event| {});
}
