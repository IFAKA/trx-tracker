/**
 * Micro-Break Overlay Module
 *
 * Hourly full-screen exercise prompts (micro-breaks)
 * - Triggers every hour
 * - Shows full-screen exercise instruction
 * - Defers if microphone is active (on a call)
 * - Reschedules deferred breaks for 5 minutes later
 */

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::time::{sleep, Duration, Instant};

const MICRO_BREAK_INTERVAL_SECS: u64 = 3600; // 1 hour
const DEFER_DURATION_SECS: u64 = 300; // 5 minutes

pub struct OverlayState {
    pub last_break: Instant,
    pub deferred_until: Option<Instant>,
}

impl OverlayState {
    pub fn new() -> Self {
        Self {
            last_break: Instant::now(),
            deferred_until: None,
        }
    }
}

/// Start micro-break overlay background task
pub async fn start_overlay(
    app_handle: tauri::AppHandle,
    state: std::sync::Arc<std::sync::Mutex<OverlayState>>,
) {
    loop {
        sleep(Duration::from_secs(60)).await; // Check every minute

        let mut overlay_state = state.lock().unwrap();
        let now = Instant::now();

        // Check if deferred break should trigger now
        if let Some(deferred_until) = overlay_state.deferred_until {
            if now >= deferred_until {
                // Time to show deferred break
                overlay_state.deferred_until = None;

                if !crate::mic::is_mic_active().unwrap_or(false) {
                    drop(overlay_state); // Release lock before showing window
                    if let Err(e) = show_overlay_window(&app_handle) {
                        tracing::error!("Failed to show overlay: {}", e);
                    }
                    let mut state_lock = state.lock().unwrap();
                    state_lock.last_break = now;
                } else {
                    // Still on call, defer again
                    overlay_state.deferred_until = Some(now + Duration::from_secs(DEFER_DURATION_SECS));
                    tracing::info!("Micro-break still deferred (mic active)");
                }
                continue;
            }
        }

        // Check if regular break should trigger
        let elapsed = now.duration_since(overlay_state.last_break);
        if elapsed.as_secs() >= MICRO_BREAK_INTERVAL_SECS {
            // Time for a break
            if crate::mic::is_mic_active().unwrap_or(false) {
                // Defer break (on a call)
                overlay_state.deferred_until = Some(now + Duration::from_secs(DEFER_DURATION_SECS));
                tracing::info!("Micro-break deferred (mic active), will retry in 5 minutes");
            } else {
                // Show break overlay
                drop(overlay_state); // Release lock before showing window
                if let Err(e) = show_overlay_window(&app_handle) {
                    tracing::error!("Failed to show overlay: {}", e);
                }
                let mut state_lock = state.lock().unwrap();
                state_lock.last_break = now;
            }
        }
    }
}

/// Show full-screen micro-break overlay
fn show_overlay_window(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Check if window already exists
    if let Some(window) = app_handle.get_webview_window("micro-break") {
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    // Create new overlay window
    let window = WebviewWindowBuilder::new(
        app_handle,
        "micro-break",
        WebviewUrl::App("/micro-break".into()),
    )
    .title("Micro-Break")
    .fullscreen(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .decorations(false)
    .resizable(false)
    .build()?;

    window.show()?;
    window.set_focus()?;

    tracing::info!("Micro-break overlay shown");

    Ok(())
}

/// Dismiss micro-break overlay (called from frontend)
#[tauri::command]
pub fn dismiss_micro_break(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("micro-break") {
        window.close().map_err(|e| e.to_string())?;
        tracing::info!("Micro-break dismissed");
    }
    Ok(())
}
