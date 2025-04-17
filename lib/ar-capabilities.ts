"use client";

/**
 * AR Capabilities Detection Module
 * Provides utilities to check device capabilities for AR features
 */

// Check if the device supports necessary AR features
export function checkARCapabilities() {
  const capabilities = {
    camera: false,
    deviceOrientation: false,
    accelerometer: false,
    touchscreen: false,
    webXR: false,
    geolocation: false,
    compatible: false,
    incompatibleReason: "",
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    devicePixelRatio:
      typeof window !== "undefined" ? window.devicePixelRatio : 1,
    fullscreen: false,
  };

  // Skip checks if not in browser environment
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    capabilities.incompatibleReason = "Not running in browser environment";
    return capabilities;
  }

  // Basic mobile detection
  capabilities.isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // OS detection
  capabilities.isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  capabilities.isAndroid = /Android/i.test(navigator.userAgent);

  // Check camera support
  capabilities.camera =
    typeof navigator.mediaDevices !== "undefined" &&
    !!navigator.mediaDevices.getUserMedia;

  // Check orientation support
  capabilities.deviceOrientation = "DeviceOrientationEvent" in window;

  // Check for accelerometer
  capabilities.accelerometer = "DeviceMotionEvent" in window;

  // Check for touch support
  capabilities.touchscreen =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  // Check for WebXR support
  capabilities.webXR = "xr" in navigator;

  // Check for geolocation
  capabilities.geolocation = "geolocation" in navigator;

  // Check for fullscreen API
  capabilities.fullscreen =
    document.documentElement.requestFullscreen !== undefined ||
    (document.documentElement as any).webkitRequestFullscreen !== undefined ||
    (document.documentElement as any).mozRequestFullScreen !== undefined ||
    (document.documentElement as any).msRequestFullscreen !== undefined;

  // Is the device generally compatible with AR?
  capabilities.compatible =
    capabilities.camera &&
    capabilities.isMobile &&
    (capabilities.deviceOrientation || capabilities.accelerometer) &&
    capabilities.touchscreen;

  // If not compatible, determine why
  if (!capabilities.compatible) {
    if (!capabilities.camera) {
      capabilities.incompatibleReason = "Camera access not available";
    } else if (!capabilities.isMobile) {
      capabilities.incompatibleReason =
        "AR navigation works best on mobile devices";
    } else if (!capabilities.deviceOrientation && !capabilities.accelerometer) {
      capabilities.incompatibleReason = "Motion sensors not available";
    } else if (!capabilities.touchscreen) {
      capabilities.incompatibleReason = "Touchscreen not detected";
    } else {
      capabilities.incompatibleReason = "Unknown compatibility issue";
    }
  }

  return capabilities;
}

// Request camera access with comprehensive error handling
export async function requestCameraAccess(
  constraints: MediaStreamConstraints = {
    video: { facingMode: "environment" },
    audio: false,
  }
) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return {
      success: true,
      stream,
      error: null,
    };
  } catch (err: any) {
    // Create friendly error messages based on the error type
    let errorMessage = "Failed to access camera";

    switch (err.name) {
      case "NotAllowedError":
        errorMessage =
          "Camera access was denied. Please check your browser permissions.";
        break;
      case "NotFoundError":
        errorMessage = "No camera found on this device.";
        break;
      case "NotReadableError":
        errorMessage = "Camera is already in use by another application.";
        break;
      case "OverconstrainedError":
        errorMessage = "The requested camera settings are not supported.";
        break;
      case "SecurityError":
        errorMessage = "Camera access is restricted due to security settings.";
        break;
      case "AbortError":
        errorMessage = "Camera access request was aborted.";
        break;
      default:
        errorMessage = `Camera error: ${err.message || "Unknown error"}`;
    }

    return {
      success: false,
      stream: null,
      error: {
        message: errorMessage,
        originalError: err,
      },
    };
  }
}

// Request device orientation permission (especially for iOS)
export async function requestOrientationPermission() {
  // Check if the device requires permission for orientation events (iOS 13+)
  const requiresPermission =
    typeof window !== "undefined" &&
    window.DeviceOrientationEvent &&
    typeof (DeviceOrientationEvent as any).requestPermission === "function";

  if (!requiresPermission) {
    // No permission needed, orientation should just work
    return {
      success: true,
      error: null,
    };
  }

  try {
    const permission = await (
      DeviceOrientationEvent as any
    ).requestPermission();
    if (permission === "granted") {
      return {
        success: true,
        error: null,
      };
    } else {
      return {
        success: false,
        error: {
          message: "Orientation permission denied",
          originalError: null,
        },
      };
    }
  } catch (err) {
    return {
      success: false,
      error: {
        message: "Failed to request orientation permission",
        originalError: err,
      },
    };
  }
}

// Get current location with better error handling
export async function getCurrentLocation(options = {}) {
  // Check if geolocation is supported
  if (!("geolocation" in navigator)) {
    return {
      success: false,
      position: null,
      error: {
        message: "Geolocation is not supported by your browser",
        originalError: null,
      },
    };
  }

  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        });
      }
    );

    return {
      success: true,
      position,
      error: null,
    };
  } catch (err: any) {
    let errorMessage = "Failed to get location";

    switch (err.code) {
      case 1: // PERMISSION_DENIED
        errorMessage = "Location access was denied";
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = "Location information is unavailable";
        break;
      case 3: // TIMEOUT
        errorMessage = "The request to get location timed out";
        break;
      default:
        errorMessage = `Location error: ${err.message || "Unknown error"}`;
    }

    return {
      success: false,
      position: null,
      error: {
        message: errorMessage,
        originalError: err,
      },
    };
  }
}

// Request fullscreen mode
export function requestFullscreen(element = document.documentElement) {
  // Check which fullscreen method is available
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    (element as any).msRequestFullscreen();
  }
}

// Exit fullscreen mode
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
}

// Check if device is currently in fullscreen mode
export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

// Register orientation event handler with proper error handling
export function registerOrientationHandler(
  callback: (orientation: DeviceOrientationEvent) => void
) {
  // Error handling wrapper for callback
  const safeCallback = (event: DeviceOrientationEvent) => {
    try {
      callback(event);
    } catch (err) {
      console.error("Error in orientation handler:", err);
    }
  };

  // Add the event listener
  window.addEventListener("deviceorientation", safeCallback);

  // Return function to remove the event listener
  return () => {
    window.removeEventListener("deviceorientation", safeCallback);
  };
}

// Helper function to calculate distance between two geographic coordinates (haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in meters

  return distance;
}

// Calculate bearing between two coordinates (direction to target)
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
}
