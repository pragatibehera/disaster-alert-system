"use client";

/**
 * Mobile AR Capabilities Utilities
 * Provides functions for mobile browser AR navigation features
 */

// Check if the device supports AR features
export function checkARCompatibility() {
  const capabilities = {
    camera: false,
    deviceOrientation: false,
    touchscreen: false,
    geolocation: false,
    compatible: false,
    incompatibleReason: "",
    isMobile: false,
    isIOS: false,
    isAndroid: false,
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

  // Check for touch support
  capabilities.touchscreen =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  // Check for geolocation
  capabilities.geolocation = "geolocation" in navigator;

  // Is the device generally compatible with AR?
  capabilities.compatible =
    capabilities.camera &&
    capabilities.isMobile &&
    capabilities.deviceOrientation &&
    capabilities.touchscreen;

  // If not compatible, determine why
  if (!capabilities.compatible) {
    if (!capabilities.camera) {
      capabilities.incompatibleReason = "Camera access not available";
    } else if (!capabilities.isMobile) {
      capabilities.incompatibleReason =
        "AR navigation works best on mobile devices";
    } else if (!capabilities.deviceOrientation) {
      capabilities.incompatibleReason = "Motion sensors not available";
    } else if (!capabilities.touchscreen) {
      capabilities.incompatibleReason = "Touchscreen not detected";
    } else {
      capabilities.incompatibleReason = "Unknown compatibility issue";
    }
  }

  return capabilities;
}

// Request camera access
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

// Request orientation permission (especially for iOS)
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

// Register an orientation event handler
export function registerOrientationHandler(
  callback: (event: DeviceOrientationEvent) => void
) {
  window.addEventListener("deviceorientation", callback);

  // Return cleanup function
  return () => {
    window.removeEventListener("deviceorientation", callback);
  };
}

// Get current location
export async function getCurrentLocation() {
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

// Calculate distance between two coordinates (in meters)
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

  return R * c; // Distance in meters
}

// Calculate bearing between two points (0-360 degrees)
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lon1 * Math.PI) / 180;
  const λ2 = (lon2 * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
}

// Generate mock navigation waypoints
export function generateMockWaypoints(
  startLat: number,
  startLng: number,
  safetyLat: number,
  safetyLng: number,
  numPoints = 5
) {
  const waypoints = [];

  // If we don't have real coordinates, generate random ones
  if (!startLat || !startLng || !safetyLat || !safetyLng) {
    let lastBearing = Math.random() * 60 - 30; // -30 to +30 degrees

    for (let i = 0; i < numPoints; i++) {
      lastBearing += Math.random() * 40 - 20; // adjust direction by -20 to +20 degrees
      const distance = 100 + i * 50 + Math.random() * 30;

      waypoints.push({
        id: `waypoint-${i}`,
        distance: distance,
        bearing: lastBearing,
        reached: false,
      });
    }

    return waypoints;
  }

  // Calculate total distance and bearing between start and safety
  const totalDistance = calculateDistance(
    startLat,
    startLng,
    safetyLat,
    safetyLng
  );
  const bearing = calculateBearing(startLat, startLng, safetyLat, safetyLng);

  // Create waypoints along the path
  for (let i = 0; i < numPoints; i++) {
    const ratio = (i + 1) / numPoints;
    const distance = totalDistance * ratio;

    // Add some randomness to the bearing (+/- 20 degrees)
    const waypointBearing = bearing + (Math.random() * 40 - 20);

    waypoints.push({
      id: `waypoint-${i}`,
      distance: distance,
      bearing: waypointBearing,
      reached: false,
    });
  }

  return waypoints;
}
