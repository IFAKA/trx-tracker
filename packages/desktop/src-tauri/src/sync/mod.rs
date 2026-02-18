/**
 * Sync Server Module
 *
 * HTTPS server for syncing workout data with mobile PWA
 * - REST API endpoints for workout data
 * - Token-based authentication
 * - SSE stream for real-time updates
 * - Self-signed TLS certificate
 */

use crate::db::Database;
use anyhow::{Context, Result};
use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::Sse,
    routing::{get, post},
    Json, Router,
};
use axum_server::tls_rustls::RustlsConfig;
use serde::Deserialize;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

const SYNC_PORT: u16 = 8841;

#[derive(Clone)]
pub struct SyncServerState {
    pub db: Arc<Mutex<Database>>,
    pub auth_token: String,
    pub device_id: String,
    pub update_tx: broadcast::Sender<String>,
}

#[derive(Deserialize)]
struct AuthQuery {
    token: Option<String>,
}

/// Start HTTPS sync server
pub async fn start_server(
    db: Arc<Mutex<Database>>,
    device_id: String,
    auth_token: String,
) -> Result<()> {

    tracing::info!("Sync server auth token: {}", auth_token);
    tracing::info!("Device ID: {}", device_id);

    // Broadcast channel for real-time updates
    let (update_tx, _) = broadcast::channel::<String>(100);

    let state = SyncServerState {
        db,
        auth_token,
        device_id: device_id.clone(),
        update_tx,
    };

    // Build router
    let app = Router::new()
        .route("/api/ping", get(handle_ping))
        .route("/api/sync/sessions", get(handle_get_sessions))
        .route("/api/sync/session", post(handle_post_session))
        .route("/api/sync/stream", get(handle_sse_stream))
        .with_state(state);

    // Load TLS certificate
    let cert = crate::cert::Certificate::get_or_create()?;
    let config = RustlsConfig::from_pem(cert.cert_pem, cert.key_pem)
        .await
        .context("Failed to load TLS config")?;

    // Bind to all interfaces
    let addr = SocketAddr::from(([0, 0, 0, 0], SYNC_PORT));

    tracing::info!("Starting HTTPS sync server on {}", addr);

    // Start server (non-blocking)
    tokio::spawn(async move {
        if let Err(e) = axum_server::bind_rustls(addr, config)
            .serve(app.into_make_service())
            .await
        {
            tracing::error!("Sync server error: {}", e);
        }
    });

    Ok(())
}

/// GET /api/ping - Device discovery (no auth required)
async fn handle_ping(
    State(state): State<SyncServerState>,
) -> Json<HashMap<String, String>> {
    let mut response = HashMap::new();
    response.insert("deviceId".to_string(), state.device_id.clone());
    response.insert("status".to_string(), "ok".to_string());
    Json(response)
}

/// GET /api/sync/sessions - Get all sessions (auth required)
async fn handle_get_sessions(
    Query(auth): Query<AuthQuery>,
    headers: HeaderMap,
    State(state): State<SyncServerState>,
) -> Result<Json<HashMap<String, JsonValue>>, StatusCode> {
    // Verify auth token
    if !verify_auth(&auth, &headers, &state.auth_token) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Get sessions from database
    let db = state.db.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let sessions = db.get_all_sessions().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(sessions))
}

/// POST /api/sync/session - Upload session (auth required)
async fn handle_post_session(
    Query(auth): Query<AuthQuery>,
    headers: HeaderMap,
    State(state): State<SyncServerState>,
    Json(payload): Json<SessionUpload>,
) -> Result<StatusCode, StatusCode> {
    // Verify auth token
    if !verify_auth(&auth, &headers, &state.auth_token) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Save session to database
    let db = state.db.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    db.save_session(&payload.date_key, &payload.session)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Broadcast update to SSE clients
    let _ = state.update_tx.send(payload.date_key);

    Ok(StatusCode::OK)
}

/// GET /api/sync/stream - SSE stream for real-time updates (auth required)
async fn handle_sse_stream(
    Query(auth): Query<AuthQuery>,
    headers: HeaderMap,
    State(state): State<SyncServerState>,
) -> Result<Sse<impl futures::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>>, StatusCode> {
    // Verify auth token
    if !verify_auth(&auth, &headers, &state.auth_token) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let mut rx = state.update_tx.subscribe();

    let stream = async_stream::stream! {
        loop {
            match rx.recv().await {
                Ok(date_key) => {
                    let event = axum::response::sse::Event::default()
                        .event("session_updated")
                        .data(date_key);
                    yield Ok(event);
                }
                Err(_) => break,
            }
        }
    };

    Ok(Sse::new(stream))
}

#[derive(Deserialize)]
struct SessionUpload {
    date_key: String,
    session: JsonValue,
}

/// Verify auth token from query or header
fn verify_auth(query: &AuthQuery, headers: &HeaderMap, expected: &str) -> bool {
    // Check query parameter first
    if let Some(token) = &query.token {
        return token == expected;
    }

    // Check Authorization header
    if let Some(auth_header) = headers.get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if let Some(token) = auth_str.strip_prefix("Bearer ") {
                return token == expected;
            }
        }
    }

    false
}

/// Generate random auth token (32 hex characters)
pub fn generate_auth_token() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..16).map(|_| rng.gen()).collect();
    hex::encode(bytes)
}

/// Generate QR code data for pairing
pub fn generate_qr_data(device_id: &str, auth_token: &str, local_ip: &str) -> String {
    format!(
        "https://traindaily.vercel.app/pair?deviceId={}&ip={}&port={}&secret={}",
        device_id, local_ip, SYNC_PORT, auth_token
    )
}

/// Get local IP address (best guess)
pub fn get_local_ip() -> Result<String> {
    use std::net::IpAddr;

    // Try to get local IP by connecting to an external address
    // (doesn't actually send data, just determines which interface would be used)
    let socket = std::net::UdpSocket::bind("0.0.0.0:0")?;
    socket.connect("8.8.8.8:80")?;
    let local_addr = socket.local_addr()?;

    match local_addr.ip() {
        IpAddr::V4(ip) => Ok(ip.to_string()),
        IpAddr::V6(_) => {
            // Fallback to 127.0.0.1 if IPv6
            Ok("127.0.0.1".to_string())
        }
    }
}
