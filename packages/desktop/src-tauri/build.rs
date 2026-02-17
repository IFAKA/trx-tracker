fn main() {
    // Link CoreAudio framework on macOS for mic detection
    #[cfg(target_os = "macos")]
    println!("cargo:rustc-link-lib=framework=CoreAudio");

    tauri_build::build()
}
