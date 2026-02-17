#!/usr/bin/env node

/**
 * Sync version across all files when semantic-release bumps version
 *
 * Usage: node scripts/sync-version.js 0.2.0
 */

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: Version number required');
  console.error('Usage: node sync-version.js 0.2.0');
  process.exit(1);
}

console.log(`🔄 Syncing version to ${newVersion}...`);

// 1. Update root package.json
const rootPackagePath = path.join(__dirname, '../package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
rootPackage.version = newVersion;
fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
console.log(`✅ Updated ${rootPackagePath}`);

// 2. Update tauri.conf.json
const tauriConfigPath = path.join(__dirname, '../packages/desktop/src-tauri/tauri.conf.json');
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
tauriConfig.version = newVersion;
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');
console.log(`✅ Updated ${tauriConfigPath}`);

// 3. Update Cargo.toml (needs regex replacement, not JSON)
const cargoTomlPath = path.join(__dirname, '../packages/desktop/src-tauri/Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(
  /^version = ".*"$/m,
  `version = "${newVersion}"`
);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log(`✅ Updated ${cargoTomlPath}`);

console.log(`\n🎉 All files synced to version ${newVersion}`);
