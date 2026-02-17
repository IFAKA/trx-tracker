/**
 * Certificate Module
 *
 * Generates self-signed TLS certificates for HTTPS sync server
 * Certificate is generated once and stored in shared data directory
 */

use anyhow::{Context, Result};
use rcgen::{generate_simple_self_signed, CertifiedKey};
use std::fs;
use std::path::PathBuf;

const SHARED_DATA_DIR: &str = "/Users/Shared/TrainDaily";
const CERT_FILE: &str = "cert.pem";
const KEY_FILE: &str = "key.pem";

pub struct Certificate {
    pub cert_pem: Vec<u8>,
    pub key_pem: Vec<u8>,
}

impl Certificate {
    /// Get or generate TLS certificate
    pub fn get_or_create() -> Result<Self> {
        let data_dir = PathBuf::from(SHARED_DATA_DIR);
        let cert_path = data_dir.join(CERT_FILE);
        let key_path = data_dir.join(KEY_FILE);

        if cert_path.exists() && key_path.exists() {
            // Load existing certificate
            let cert_pem = fs::read(&cert_path)
                .context("Failed to read certificate")?;
            let key_pem = fs::read(&key_path)
                .context("Failed to read private key")?;

            Ok(Self { cert_pem, key_pem })
        } else {
            // Generate new certificate
            let subject_alt_names = vec![
                "localhost".to_string(),
                "127.0.0.1".to_string(),
                "0.0.0.0".to_string(),
            ];

            let cert = generate_simple_self_signed(subject_alt_names)
                .context("Failed to generate certificate")?;

            let cert_pem = cert.cert.pem().into_bytes();
            let key_pem = cert.key_pair.serialize_pem().into_bytes();

            // Save for future runs
            fs::write(&cert_path, &cert_pem)
                .context("Failed to write certificate")?;
            fs::write(&key_path, &key_pem)
                .context("Failed to write private key")?;

            tracing::info!("Generated new TLS certificate");

            Ok(Self { cert_pem, key_pem })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_certificate_generation() {
        let cert = Certificate::get_or_create().unwrap();
        assert!(!cert.cert_pem.is_empty());
        assert!(!cert.key_pem.is_empty());
    }
}
