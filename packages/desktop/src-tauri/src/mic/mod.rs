/**
 * Microphone Detection Module (macOS CoreAudio)
 *
 * Detects if microphone is currently active (in use by any application)
 * Used to defer micro-breaks during video calls/screen sharing
 *
 * Ported from: extension/native/trx_mic_check.sh (Swift)
 */

#[cfg(target_os = "macos")]
use anyhow::Result;

#[cfg(target_os = "macos")]
extern "C" {
    // CoreAudio system functions
    fn AudioObjectGetPropertyData(
        inObjectID: u32,
        inAddress: *const AudioObjectPropertyAddress,
        inQualifierDataSize: u32,
        inQualifierData: *const std::ffi::c_void,
        ioDataSize: *mut u32,
        outData: *mut std::ffi::c_void,
    ) -> i32;
}

#[cfg(target_os = "macos")]
#[repr(C)]
#[allow(non_snake_case)]
struct AudioObjectPropertyAddress {
    mSelector: u32,
    mScope: u32,
    mElement: u32,
}

#[cfg(target_os = "macos")]
#[allow(non_upper_case_globals)]
const kAudioObjectSystemObject: u32 = 1;
#[cfg(target_os = "macos")]
#[allow(non_upper_case_globals)]
const kAudioHardwarePropertyDefaultInputDevice: u32 = 0x64696e20; // 'din '
#[cfg(target_os = "macos")]
#[allow(non_upper_case_globals)]
const kAudioDevicePropertyDeviceIsRunningSomewhere: u32 = 0x67727275; // 'grru'
#[cfg(target_os = "macos")]
#[allow(non_upper_case_globals)]
const kAudioObjectPropertyScopeGlobal: u32 = 0x676c6f62; // 'glob'
#[cfg(target_os = "macos")]
#[allow(non_upper_case_globals)]
const kAudioObjectPropertyElementMain: u32 = 0;

/// Check if microphone is currently active (in use)
#[cfg(target_os = "macos")]
pub fn is_mic_active() -> Result<bool> {
    unsafe {
        // Step 1: Get default input device ID
        let input_device_address = AudioObjectPropertyAddress {
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain,
        };

        let mut device_id: u32 = 0;
        let mut size = std::mem::size_of::<u32>() as u32;

        let status = AudioObjectGetPropertyData(
            kAudioObjectSystemObject,
            &input_device_address,
            0,
            std::ptr::null(),
            &mut size,
            &mut device_id as *mut _ as *mut std::ffi::c_void,
        );

        if status != 0 {
            tracing::warn!("Failed to get default input device: {}", status);
            return Ok(false);
        }

        if device_id == 0 {
            // No input device configured
            return Ok(false);
        }

        // Step 2: Check if device is running
        let running_address = AudioObjectPropertyAddress {
            mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain,
        };

        let mut is_running: u32 = 0;
        let mut size = std::mem::size_of::<u32>() as u32;

        let status = AudioObjectGetPropertyData(
            device_id,
            &running_address,
            0,
            std::ptr::null(),
            &mut size,
            &mut is_running as *mut _ as *mut std::ffi::c_void,
        );

        if status != 0 {
            tracing::warn!("Failed to check if device is running: {}", status);
            return Ok(false);
        }

        Ok(is_running != 0)
    }
}

/// Fallback for non-macOS platforms
#[cfg(not(target_os = "macos"))]
pub fn is_mic_active() -> Result<bool> {
    // Not implemented for non-macOS platforms
    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mic_detection() {
        // Should not panic
        let result = is_mic_active();
        assert!(result.is_ok());

        // Log result for manual verification
        println!("Mic active: {:?}", result.unwrap());
    }
}
