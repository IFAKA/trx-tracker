/**
 * Micro-Break Overlay Module (Evidence-Based)
 *
 * Research-backed micro-breaks for prolonged sitting workers
 * - Triggers every 30 minutes (optimal for desk workers)
 * - 2-3 min active breaks (walking/movement)
 * - Work hours: 8am-midnight (16-hour workday)
 * - Skips rest days (Sunday)
 * - Defers if microphone is active (on a call)
 *
 * Evidence: https://www.tandfonline.com/doi/full/10.1080/23311916.2022.2026206
 * Meta-analysis: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460
 */

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::time::{sleep, Duration, Instant};
use chrono::{Local, Datelike, Timelike};

// Evidence-based intervals: 2-3 min breaks every 30 min for sedentary workers
const MICRO_BREAK_INTERVAL_SECS: u64 = 1800; // 30 minutes (was 60)
const DEFER_DURATION_SECS: u64 = 300; // 5 minutes

// Work hours for 16-hour daily computer use (8am-midnight)
const WORK_START_HOUR: u8 = 8;  // 8:00 AM
const WORK_END_HOUR: u8 = 24;   // 12:00 AM (midnight)

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

/// Check if current time is within work hours and not a rest day
fn should_trigger_break() -> bool {
    let now = Local::now();
    let hour = now.hour() as u8;
    let weekday = now.weekday();

    // Skip on Sunday (rest day = 0 in chrono, Sun)
    if weekday == chrono::Weekday::Sun {
        return false;
    }

    // Only during work hours (8am-midnight for 16h workday)
    hour >= WORK_START_HOUR && hour < WORK_END_HOUR
}

/// Start micro-break overlay background task
pub async fn start_overlay(
    app_handle: tauri::AppHandle,
    state: std::sync::Arc<std::sync::Mutex<OverlayState>>,
) {
    loop {
        sleep(Duration::from_secs(60)).await; // Check every minute

        // Skip if outside work hours or rest day
        if !should_trigger_break() {
            continue;
        }

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
