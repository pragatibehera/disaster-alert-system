"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpCircle,
  MapPin,
  AlertTriangle,
  Compass,
  Map,
  Navigation,
  Target,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Interface for the component props
interface ARSafetyNavigatorProps {
  disaster: {
    type: string;
    location: string;
    severity: string;
  };
  onClose: () => void;
}

// Helper to generate mock waypoints for the evacuation route
function generateMockWaypoints(numPoints = 5) {
  const waypoints = [];
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

export function ARSafetyNavigator({
  disaster,
  onClose,
}: ARSafetyNavigatorProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State for permissions and status
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [incompatibleBrowser, setIncompatibleBrowser] = useState(false);
  const [hasOrientationPermission, setHasOrientationPermission] = useState<
    boolean | null
  >(null);

  // State for navigation
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [safetyDirection, setSafetyDirection] = useState<number>(0);
  const [evacuationProgress, setEvacuationProgress] = useState(0);

  // UI state
  const [showDirections, setShowDirections] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [waypoints, setWaypoints] = useState(generateMockWaypoints());
  const [showWaypointReached, setShowWaypointReached] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

  // Check browser compatibility
  useEffect(() => {
    // Check if getUserMedia is supported
    const isMediaDevicesSupported =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia;

    if (!isMediaDevicesSupported) {
      console.log("Media devices not supported in this browser");
      setIncompatibleBrowser(true);
      setLoading(false);
      return;
    }

    // Check if DeviceOrientation API is supported
    const isOrientationSupported = "DeviceOrientationEvent" in window;
    if (!isOrientationSupported) {
      console.log("Device orientation not supported in this browser");
    }
  }, []);

  // Request and set up camera
  useEffect(() => {
    if (!videoRef.current || incompatibleBrowser || !loading) return;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        } else {
          console.error("Still no video element after setup");
          setError("Camera initialization failed");
        }
      } catch (err: any) {
        setError("Camera permission denied or error occurred");
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    // Delay slightly to ensure video element is mounted
    setTimeout(setupCamera, 50);
  }, [videoRef.current, incompatibleBrowser, loading]);

  // Set up device orientation for compass
  useEffect(() => {
    // Skip if browser is incompatible
    if (incompatibleBrowser) return;

    // Function to handle orientation events
    function handleOrientation(event: DeviceOrientationEvent) {
      if (event.alpha !== null) {
        setCompassHeading(event.alpha);
      }
    }

    // Check if we need to request permission (iOS 13+)
    async function setupOrientationTracking() {
      try {
        // For iOS 13+ devices
        if (
          typeof window !== "undefined" &&
          window.DeviceOrientationEvent &&
          typeof (DeviceOrientationEvent as any).requestPermission ===
            "function"
        ) {
          console.log("Requesting DeviceOrientation permission for iOS");
          const permissionState = await (
            DeviceOrientationEvent as any
          ).requestPermission();

          if (permissionState === "granted") {
            console.log("DeviceOrientation permission granted");
            window.addEventListener("deviceorientation", handleOrientation);
            setHasOrientationPermission(true);
          } else {
            console.log("DeviceOrientation permission denied");
            setHasOrientationPermission(false);
          }
        }
        // For non-iOS devices or older iOS versions
        else {
          console.log("No special permission needed for DeviceOrientation");
          window.addEventListener("deviceorientation", handleOrientation);
          setHasOrientationPermission(true);
        }
      } catch (err) {
        console.error("Error requesting orientation permission:", err);
        setHasOrientationPermission(false);
      }
    }

    // Start orientation setup
    setupOrientationTracking();

    // Simulate distance calculation
    const interval = setInterval(() => {
      const randomDistance = (0.5 + Math.random() * 1.5).toFixed(1);
      setDistance(`${randomDistance} miles`);
    }, 3000);

    // Simulate initial safety direction
    const initialDirection = Math.random() * 360;
    setSafetyDirection(initialDirection);

    // Set up a separate interval for updating safety direction with small changes
    const directionInterval = setInterval(() => {
      setSafetyDirection((prev) => (prev + (Math.random() * 2 - 1)) % 360);
    }, 2000);

    // Simulate evacuation progress
    const progressInterval = setInterval(() => {
      setEvacuationProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 2, 100);
        return newProgress;
      });
    }, 5000);

    // Simulate waypoint reaches
    const waypointInterval = setInterval(() => {
      if (currentWaypoint < waypoints.length - 1) {
        // Simulate reaching a waypoint
        setWaypoints((prevWaypoints) => {
          const newWaypoints = [...prevWaypoints];
          newWaypoints[currentWaypoint].reached = true;
          return newWaypoints;
        });

        setShowWaypointReached(true);
        setTimeout(() => setShowWaypointReached(false), 2000);

        setCurrentWaypoint((prev) => prev + 1);
      }
    }, 15000);

    // Clean up all listeners and intervals
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearInterval(interval);
      clearInterval(directionInterval);
      clearInterval(progressInterval);
      clearInterval(waypointInterval);
    };
  }, [incompatibleBrowser, currentWaypoint, waypoints.length]);

  // Calculate the visual rotation of the arrow based on compass and safety direction
  const arrowRotation = (safetyDirection - compassHeading + 360) % 360;

  // Start calibration
  const handleCalibrate = () => {
    setCalibrating(true);

    // Simulate calibration process
    setTimeout(() => {
      setCalibrating(false);
      setWaypoints(generateMockWaypoints());
      setCurrentWaypoint(0);
    }, 3000);
  };

  // Handle request for device orientation permission (iOS)
  const requestOrientationPermission = async () => {
    if (
      typeof window !== "undefined" &&
      window.DeviceOrientationEvent &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permissionState === "granted") {
          setHasOrientationPermission(true);
          window.location.reload(); // Refresh to activate sensors
        } else {
          setHasOrientationPermission(false);
        }
      } catch (err) {
        console.error("Error requesting orientation permission:", err);
        setHasOrientationPermission(false);
      }
    }
  };

  // Browser compatibility check
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

  // Loading state
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

  // Error state
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

  // Camera permission denied
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

  // Orientation permission denied (iOS)
  if (hasOrientationPermission === false) {
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
          onClick={requestOrientationPermission}
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

  // Fallback mode (no camera)
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

        {/* Exit Button */}
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

  // Main AR view
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-black">
      {/* Camera view */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
        onCanPlay={() => {
          console.log("Video can play now");
          setLoading(false);
        }}
        onError={(e) => {
          console.error("Video error:", e);
          setError("Failed to start camera stream");
          setHasPermission(false);
          setLoading(false);
        }}
        className="h-full w-full object-cover"
      />

      {/* Calibration Overlay */}
      {calibrating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-black/70 p-6 rounded-lg text-center">
            <div className="h-12 w-12 text-blue-400 mx-auto animate-spin mb-3 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-white text-lg font-medium">Calibrating...</p>
            <p className="text-white/70 text-sm mt-2">
              Please rotate your device in a figure-8 pattern
            </p>
          </div>
        </div>
      )}

      {/* AR Overlay with enhanced UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Direction Arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: arrowRotation }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative z-10"
          >
            <ArrowUpCircle className="h-32 w-32 text-red-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </motion.div>

          {/* Waypoint reached notification */}
          {showWaypointReached && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/3 left-0 right-0 text-center"
            >
              <div className="bg-green-500/80 mx-auto py-2 px-4 rounded-lg inline-flex items-center">
                <div className="mr-2 h-5 w-5 text-white">✓</div>
                <span className="text-white font-medium">
                  Waypoint reached!
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Waypoints visualization */}
        {showDirections && (
          <div className="absolute left-0 right-0 top-1/2 flex justify-center items-center">
            <div className="relative h-1 bg-white/20 w-3/4 rounded-full overflow-hidden">
              {waypoints.map((waypoint, index) => (
                <div
                  key={waypoint.id}
                  className={`absolute w-6 h-6 -mt-2.5 rounded-full flex items-center justify-center transition-colors
                    ${
                      index === currentWaypoint
                        ? "bg-blue-500 border-2 border-white"
                        : waypoint.reached
                        ? "bg-green-500"
                        : "bg-white/50"
                    }`}
                  style={{ left: `${(index / (waypoints.length - 1)) * 100}%` }}
                >
                  {index === currentWaypoint && (
                    <div className="absolute w-10 h-10 rounded-full border-2 border-blue-400 animate-ping"></div>
                  )}
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disaster Info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              <span className="font-bold">{disaster.type} Alert</span>
              <Badge
                variant="outline"
                className="ml-2 bg-red-900/50 text-white border-red-500/50"
              >
                {disaster.severity.toUpperCase()}
              </Badge>
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

        {/* Safety Instructions with Enhanced UI */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white z-10">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-bold">EVACUATION ROUTE</p>
            <div className="rounded-full bg-white/20 px-2 py-1 text-sm flex items-center">
              <Target className="mr-1 h-3.5 w-3.5" />
              <span className="font-medium">{distance}</span> from hazard
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-white/70">Evacuation Progress</span>
              <span className="text-xs font-medium">
                {Math.round(evacuationProgress)}%
              </span>
            </div>
            <Progress value={evacuationProgress} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Current Waypoint: </span>
              <span>
                {currentWaypoint + 1} of {waypoints.length}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Next: </span>
              <span>{waypoints[currentWaypoint]?.distance.toFixed(0)}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 top-14 z-10 flex flex-col gap-2 pointer-events-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <Map className="mr-2 h-4 w-4" />
          Exit AR Mode
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDirections(!showDirections)}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <Navigation className="mr-2 h-4 w-4" />
          {showDirections ? "Hide Route" : "Show Route"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCalibrate}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Recalibrate
        </Button>
      </div>
    </div>
  );
}
