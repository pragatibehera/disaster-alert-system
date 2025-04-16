"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpCircle,
  MapPin,
  AlertTriangle,
  Compass,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Add type definition for iOS DeviceOrientationEvent with requestPermission
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<"granted" | "denied">;
}

// Cast the DeviceOrientationEvent to include the iOS specific requestPermission method
const DeviceOrientationEventIOS = (typeof window !== "undefined"
  ? window.DeviceOrientationEvent
  : null) as unknown as DeviceOrientationEventStatic;

interface ARSafetyNavigatorProps {
  disaster: {
    type: string;
    location: string;
    severity: string;
    lat?: number;
    lng?: number;
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
  onClose: () => void;
}

export function ARSafetyNavigator({
  disaster,
  userLocation,
  onClose,
}: ARSafetyNavigatorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsOrientationPermission, setNeedsOrientationPermission] =
    useState(false);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [incompatibleBrowser, setIncompatibleBrowser] = useState(false);

  // Direction to safety (opposite of disaster direction)
  // This would normally be calculated based on real GPS coordinates
  const [safetyDirection, setSafetyDirection] = useState<number>(0);

  // Check browser compatibility
  useEffect(() => {
    // Check if getUserMedia is supported
    const isMediaDevicesSupported =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia;

    if (!isMediaDevicesSupported) {
      setIncompatibleBrowser(true);
      setLoading(false);
    }
  }, []);

  // Set up camera stream
  useEffect(() => {
    // Skip if browser is incompatible
    if (incompatibleBrowser) return;

    // Set mounted ref to true when component mounts
    isMountedRef.current = true;

    let retryCount = 0;
    const maxRetries = 3;

    async function setupCamera() {
      // Check if component is still mounted
      if (!isMountedRef.current) return;

      try {
        setLoading(true);

        // Add a slight delay to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if component is still mounted after delay
        if (!isMountedRef.current) return;

        // Check if video ref is available
        if (!videoRef.current) {
          console.error(
            `Video ref not available - attempt ${retryCount + 1}/${maxRetries}`
          );
          // Only retry a limited number of times to avoid infinite loops
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(setupCamera, 1000);
            return;
          } else {
            throw new Error(
              "Could not initialize camera after multiple attempts"
            );
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        // Check again if component is still mounted and ref is valid
        if (isMountedRef.current && videoRef.current) {
          videoRef.current.srcObject = stream;
          // onCanPlay event will set loading to false
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        // Only set state if component is still mounted
        if (isMountedRef.current) {
          setError(
            err.name === "NotAllowedError"
              ? "Camera access denied. Please enable camera permissions in your browser settings."
              : err.message || "Failed to initialize camera. Please try again."
          );
          setHasPermission(false);
          setLoading(false);
        }
      }
    }

    // Start camera setup
    setupCamera();

    // Clean up function
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, [incompatibleBrowser]);

  // Set up device orientation for compass
  useEffect(() => {
    let orientationPermissionRequested = false;

    async function requestOrientationPermission() {
      // Check if DeviceOrientationEvent is available and if permission is required (iOS 13+)
      if (
        typeof DeviceOrientationEventIOS !== "undefined" &&
        typeof DeviceOrientationEventIOS.requestPermission === "function"
      ) {
        try {
          const permission =
            await DeviceOrientationEventIOS.requestPermission();

          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            orientationPermissionRequested = true;
            setNeedsOrientationPermission(false);
          } else {
            console.warn("Device orientation permission not granted");
            setNeedsOrientationPermission(true);
          }
        } catch (error) {
          console.error(
            "Error requesting device orientation permission:",
            error
          );
          setNeedsOrientationPermission(true);
        }
      } else {
        // For browsers that don't require permission
        window.addEventListener("deviceorientation", handleOrientation);
        orientationPermissionRequested = true;
      }
    }

    function handleOrientation(event: DeviceOrientationEvent) {
      // Alpha is the compass direction the device is facing
      const alpha = event.alpha;
      if (alpha !== null) {
        setCompassHeading(alpha);
      }
    }

    // Request permission when component mounts
    if (!orientationPermissionRequested) {
      requestOrientationPermission();
    }

    // Simulation of distance calculation
    const interval = setInterval(() => {
      // In a real app, you would calculate actual distance based on GPS coordinates
      const randomDistance = (0.5 + Math.random() * 1.5).toFixed(1);
      setDistance(`${randomDistance} miles`);
    }, 3000);

    // Simulate initial safety direction - only set once on mount
    const initialDirection = Math.random() * 360;
    setSafetyDirection(initialDirection);

    // Set up a separate interval for updating safety direction with small changes
    const directionInterval = setInterval(() => {
      setSafetyDirection((prev) => (prev + (Math.random() * 2 - 1)) % 360);
    }, 2000);

    return () => {
      if (orientationPermissionRequested) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      clearInterval(interval);
      clearInterval(directionInterval);
    };
  }, []); // Empty dependency array to run only on mount

  // Calculate the visual rotation of the arrow based on compass and safety direction
  const arrowRotation = (safetyDirection - compassHeading + 360) % 360;

  if (incompatibleBrowser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <p className="text-center text-lg font-medium">Browser Not Supported</p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Your browser doesn't support the camera features needed for AR
          navigation. Please try using a modern browser like Chrome, Safari, or
          Firefox.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              setIncompatibleBrowser(false);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Fallback Mode
          </Button>
          <Button onClick={onClose} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        <p className="text-center text-lg font-medium">
          Initializing AR Navigator...
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Please allow camera access when prompted
        </p>
        <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
          This may take a moment. Make sure your camera is not being used by
          another application.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <p className="text-center text-lg font-medium text-red-600">{error}</p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          AR navigation requires camera access to function properly.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              // Reset states and try again
              setError(null);
              setLoading(true);
              setHasPermission(null);

              // Force reload to restart permissions
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => {
              setError(null);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Fallback Mode
          </Button>
          <Button onClick={onClose} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <p className="text-center text-lg font-medium">
          Camera access required
        </p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Please enable camera permissions in your browser settings to use the
          AR navigation feature.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              setHasPermission(null);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Fallback Mode
          </Button>
          <Button onClick={onClose} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (needsOrientationPermission) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <Compass className="mb-4 h-12 w-12 text-blue-500" />
        <p className="text-center text-lg font-medium">
          Orientation access required
        </p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          AR navigation requires access to your device's orientation sensors to
          show directional guidance.
        </p>
        <Button
          onClick={async () => {
            if (
              typeof DeviceOrientationEventIOS !== "undefined" &&
              typeof DeviceOrientationEventIOS.requestPermission === "function"
            ) {
              try {
                const permission =
                  await DeviceOrientationEventIOS.requestPermission();
                if (permission === "granted") {
                  setNeedsOrientationPermission(false);
                  window.location.reload(); // Refresh to activate sensors
                }
              } catch (err) {
                console.error("Error requesting orientation permission:", err);
              }
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Allow Device Orientation
        </Button>
        <Button onClick={onClose} variant="outline" className="mt-2">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Fallback mode without camera
  if (useFallbackMode) {
    return (
      <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Static Directional Guidance */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white mb-4 text-lg font-medium">
            Static Navigation Mode
          </p>

          {/* Direction Arrow */}
          <motion.div
            animate={{ rotate: arrowRotation }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative"
          >
            <ArrowUpCircle className="h-32 w-32 text-red-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </motion.div>

          <p className="text-white mt-6 max-w-xs text-center">
            Move in the direction of the arrow to navigate away from the{" "}
            {disaster.type.toLowerCase()} area.
          </p>
        </div>

        {/* Disaster Info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              <span className="font-bold">{disaster.type} Alert</span>
            </div>
            <div className="flex items-center">
              <Compass className="mr-1 h-4 w-4" />
              <span className="text-sm">{Math.round(compassHeading)}°</span>
            </div>
          </div>
          <div className="mt-1 flex items-center text-sm">
            <MapPin className="mr-1 h-4 w-4 text-red-400" />
            <span>{disaster.location}</span>
          </div>
        </div>

        {/* Safety Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="mb-1 text-lg font-bold">EVACUATION ROUTE</p>
          <div className="flex items-center justify-between">
            <p className="text-sm">Move in direction of arrow</p>
            <div className="rounded-full bg-white/20 px-2 py-1 text-sm">
              <span className="font-medium">{distance}</span> from hazard
            </div>
          </div>
        </div>

        {/* Exit AR Mode Button */}
        <div className="absolute right-4 top-14 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70 border-white/30"
          >
            <Map className="mr-2 h-4 w-4" />
            Exit Navigation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-black">
      {/* Camera view */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => {
          setHasPermission(true);
          setLoading(false);
        }}
        onError={(e) => {
          console.error("Video error:", e);
          setError("Failed to start camera stream");
          setHasPermission(false);
          setLoading(false);
        }}
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
            <p className="text-white text-lg">Starting camera...</p>
          </div>
        </div>
      )}

      {/* AR Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Direction Arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: arrowRotation }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative"
          >
            <ArrowUpCircle className="h-32 w-32 text-red-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </motion.div>
        </div>

        {/* Disaster Info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              <span className="font-bold">{disaster.type} Alert</span>
            </div>
            <div className="flex items-center">
              <Compass className="mr-1 h-4 w-4" />
              <span className="text-sm">{Math.round(compassHeading)}°</span>
            </div>
          </div>
          <div className="mt-1 flex items-center text-sm">
            <MapPin className="mr-1 h-4 w-4 text-red-400" />
            <span>{disaster.location}</span>
          </div>
        </div>

        {/* Safety Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="mb-1 text-lg font-bold">EVACUATION ROUTE</p>
          <div className="flex items-center justify-between">
            <p className="text-sm">Move in direction of arrow</p>
            <div className="rounded-full bg-white/20 px-2 py-1 text-sm">
              <span className="font-medium">{distance}</span> from hazard
            </div>
          </div>
        </div>
      </div>

      {/* Exit AR Mode Button */}
      <div className="absolute right-4 top-14 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <Map className="mr-2 h-4 w-4" />
          Exit AR Mode
        </Button>
      </div>
    </div>
  );
}
