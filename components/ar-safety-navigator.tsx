"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpCircle,
  MapPin,
  AlertTriangle,
  Compass,
  Map,
  Navigation,
  Target,
  RotateCcw,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  // UI state
  const [showDirections, setShowDirections] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [waypoints, setWaypoints] = useState(generateMockWaypoints());
  const [showWaypointReached, setShowWaypointReached] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check browser compatibility
  useEffect(() => {
    // More comprehensive browser compatibility check
    const checkBrowserCompatibility = () => {
      const isMediaDevicesSupported =
        typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        !!navigator.mediaDevices.getUserMedia;

      // Check for WebXR support (advanced AR)
      const isWebXRSupported =
        typeof navigator !== "undefined" && "xr" in navigator;

      // Check for deviceorientation support
      const isOrientationSupported = "DeviceOrientationEvent" in window;

      // Check if we're on a mobile device
      const isMobileDevice =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Special check for iOS 13+ which requires permission for deviceorientation
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;
      const isiOS13Plus =
        isIOS &&
        typeof window !== "undefined" &&
        window.DeviceOrientationEvent &&
        typeof (DeviceOrientationEvent as any).requestPermission === "function";

      if (!isMediaDevicesSupported) {
        console.warn("Media devices not supported");
        setIncompatibleBrowser(true);
        setLoading(false);
        return false;
      }

      if (!isOrientationSupported) {
        console.warn("Device orientation not supported");
        // We'll continue but might need fallback mode
      }

      if (isiOS13Plus) {
        setShowPermissionPrompt(true);
      }

      return true;
    };

    const isCompatible = checkBrowserCompatibility();
    if (!isCompatible) {
      toast({
        title: "Browser Not Fully Compatible",
        description: "Some AR features may be limited on your device.",
        variant: "destructive",
      });
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          // Continue without precise location
        }
      );
    }
  }, []);

  // Setup device orientation for compass with better permission handling
  useEffect(() => {
    if (incompatibleBrowser) return;

    // Function to handle orientation events
    function handleOrientation(event: DeviceOrientationEvent) {
      if (event.alpha !== null) {
        // Alpha is the compass direction the device is facing
        setCompassHeading(event.alpha);
      }
    }

    // Setup orientation permissions and tracking
    async function setupOrientationTracking() {
      try {
        // For iOS 13+ devices
        if (
          typeof window !== "undefined" &&
          window.DeviceOrientationEvent &&
          typeof (DeviceOrientationEvent as any).requestPermission ===
            "function"
        ) {
          if (showPermissionPrompt) {
            // Wait for user to explicitly request permission via UI
            return;
          }

          try {
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
              toast({
                title: "Permission Denied",
                description:
                  "Orientation sensors are needed for AR navigation.",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error("iOS orientation permission error:", err);
            setHasOrientationPermission(false);
          }
        }
        // For non-iOS devices or older iOS versions
        else {
          window.addEventListener("deviceorientation", handleOrientation);
          setHasOrientationPermission(true);
        }
      } catch (err) {
        console.error("Error setting up orientation:", err);
        setHasOrientationPermission(false);
      }
    }

    setupOrientationTracking();

    // Simulate distance calculation (in a real app, this would use actual geolocation)
    const distanceInterval = setInterval(() => {
      const randomDistance = (0.5 + Math.random() * 1.5).toFixed(1);
      setDistance(`${randomDistance} miles`);
    }, 3000);

    // Set initial safety direction
    const initialDirection = Math.random() * 360;
    setSafetyDirection(initialDirection);

    // Set up a separate interval for updating safety direction with small changes to simulate movement
    const directionInterval = setInterval(() => {
      setSafetyDirection((prev) => (prev + (Math.random() * 2 - 1)) % 360);
    }, 2000);

    // Simulate evacuation progress increase
    const progressInterval = setInterval(() => {
      setEvacuationProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 2, 100);
        return newProgress;
      });
    }, 5000);

    // Simulate reaching waypoints
    const waypointInterval = setInterval(() => {
      if (currentWaypoint < waypoints.length - 1 && !showInstructions) {
        // Simulate reaching a waypoint
        setWaypoints((prevWaypoints) => {
          const newWaypoints = [...prevWaypoints];
          newWaypoints[currentWaypoint].reached = true;
          return newWaypoints;
        });

        // Show waypoint reached notification
        setShowWaypointReached(true);
        setTimeout(() => setShowWaypointReached(false), 2000);

        // Move to next waypoint
        setCurrentWaypoint((prev) => prev + 1);
      }
    }, 15000);

    // Clean up all listeners and intervals
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearInterval(distanceInterval);
      clearInterval(directionInterval);
      clearInterval(progressInterval);
      clearInterval(waypointInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    incompatibleBrowser,
    currentWaypoint,
    waypoints.length,
    showInstructions,
    showPermissionPrompt,
  ]);

  // Request and set up camera with improved error handling
  useEffect(() => {
    if (
      !videoRef.current ||
      incompatibleBrowser ||
      !loading ||
      showInstructions
    )
      return;

    const setupCamera = async () => {
      try {
        // First, try with both camera and microphone to maximize compatibility
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
          },
          audio: false,
        };

        console.log("Requesting media with constraints:", constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Store the stream reference for cleanup
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  setHasPermission(true);
                  setLoading(false);
                  // Start canvas rendering if we're using AR overlay
                  if (canvasRef.current) {
                    startARRendering();
                  }
                })
                .catch((err) => {
                  console.error("Error playing video:", err);
                  setError("Failed to start camera stream. Please try again.");
                  setHasPermission(false);
                  setLoading(false);
                });
            }
          };
        } else {
          console.error("Video element not available after setup");
          setError("Camera initialization failed. Please reload.");
          setHasPermission(false);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Camera permission error:", err);

        // Provide more specific error messages based on the error
        if (err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Please allow camera access in your browser settings."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is already in use by another application.");
        } else {
          setError(
            "Failed to access camera: " + (err.message || "Unknown error")
          );
        }

        setHasPermission(false);
        setLoading(false);
      }
    };

    setupCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [videoRef.current, incompatibleBrowser, loading, showInstructions]);

  // Function to start AR rendering on canvas
  const startARRendering = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const renderFrame = () => {
      if (!canvasRef.current || !videoRef.current) return;

      // Match canvas size to video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0);

      // Draw AR elements here (arrows, indicators, etc.)
      drawARElements(ctx);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  };

  // Function to draw AR elements on canvas
  const drawARElements = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Example: Draw direction arrow
    const arrowSize = Math.min(width, height) * 0.2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate arrow rotation based on compass and safety direction
    const arrowRotation = (safetyDirection - compassHeading + 360) % 360;
    const radians = (arrowRotation * Math.PI) / 180;

    // Save context state
    ctx.save();

    // Translate to center
    ctx.translate(centerX, centerY);

    // Rotate context
    ctx.rotate(radians);

    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize); // Arrow tip
    ctx.lineTo(arrowSize / 2, arrowSize / 3); // Bottom right
    ctx.lineTo(0, 0); // Middle bottom
    ctx.lineTo(-arrowSize / 2, arrowSize / 3); // Bottom left
    ctx.closePath();

    // Style and fill arrow
    ctx.fillStyle = "rgba(255, 50, 50, 0.7)";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Restore context
    ctx.restore();
  };

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
      toast({
        title: "Calibration Complete",
        description: "Your AR navigator has been recalibrated.",
      });
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
          setShowPermissionPrompt(false);
          window.location.reload(); // Refresh to activate sensors
        } else {
          setHasOrientationPermission(false);
          toast({
            title: "Permission Denied",
            description: "Motion sensors are needed for AR navigation.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error requesting orientation permission:", err);
        setHasOrientationPermission(false);
      }
    } else {
      // For non-iOS devices, just continue
      setHasOrientationPermission(true);
      setShowPermissionPrompt(false);
    }
  };

  // Handle start AR navigation after instructions
  const handleStartAR = () => {
    setShowInstructions(false);
    setLoading(true); // Trigger camera setup
  };

  // Instructions screen
  if (showInstructions) {
    return (
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-black text-white p-6">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            AR Navigation Instructions
          </h2>
          <p className="text-slate-300 mb-8">
            Follow these steps to safely navigate away from the{" "}
            {disaster.type.toLowerCase()} area.
          </p>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <div className="bg-slate-800/70 p-4 rounded-lg flex items-start">
            <div className="bg-red-500/20 p-2 rounded-full mr-3 mt-1">
              <Camera className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium">Allow Camera Access</h3>
              <p className="text-sm text-slate-300">
                The app needs to use your camera to show evacuation directions
                overlaid on your surroundings.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-lg flex items-start">
            <div className="bg-blue-500/20 p-2 rounded-full mr-3 mt-1">
              <Compass className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Allow Motion Sensors</h3>
              <p className="text-sm text-slate-300">
                Motion and orientation sensors help determine which direction
                you're facing for accurate navigation.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-lg flex items-start">
            <div className="bg-green-500/20 p-2 rounded-full mr-3 mt-1">
              <Navigation className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Follow the Arrows</h3>
              <p className="text-sm text-slate-300">
                Hold your phone upright and follow the direction of the arrows
                to navigate to safety.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-lg flex items-start">
            <div className="bg-amber-500/20 p-2 rounded-full mr-3 mt-1">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium">Reach All Waypoints</h3>
              <p className="text-sm text-slate-300">
                Follow the path through each waypoint until you reach a safe
                area away from danger.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-md">
          <Button
            onClick={handleStartAR}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Navigation className="mr-2 h-5 w-5" />
            Start AR Navigation
          </Button>
        </div>
      </div>
    );
  }

  // Permission prompt for iOS devices
  if (showPermissionPrompt) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <Compass className="h-16 w-16 text-blue-500 mb-6" />
        <h2 className="text-xl font-bold mb-3 text-center">
          Sensor Access Required
        </h2>
        <p className="text-center mb-6 max-w-md">
          AR navigation requires access to your device's orientation sensors to
          show directional guidance. iOS requires explicit permission for these
          sensors.
        </p>
        <Button
          onClick={requestOrientationPermission}
          className="bg-blue-600 hover:bg-blue-700 text-white mb-3"
          size="lg"
        >
          Allow Motion & Orientation Access
        </Button>
        <Button
          onClick={() => {
            setUseFallbackMode(true);
            setShowPermissionPrompt(false);
          }}
          variant="outline"
          className="border-white/30 text-white"
        >
          Continue in Basic Mode
        </Button>
      </div>
    );
  }

  // Browser compatibility check
  if (incompatibleBrowser) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">
          Browser Not Supported
        </h2>
        <p className="text-center mb-6 max-w-md">
          Your browser doesn't support all the features needed for AR
          navigation. For the best experience, please use Safari (iOS) or Chrome
          (Android).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              setIncompatibleBrowser(false);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Basic Navigation Mode
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-red-500 animate-spin mb-6"></div>
        <h2 className="text-xl font-bold mb-2 text-center">
          Initializing AR Navigator...
        </h2>
        <p className="text-center text-sm text-slate-300 mb-1">
          Please allow camera access when prompted
        </p>
        <p className="text-center max-w-xs text-xs text-slate-400">
          This may take a moment. Make sure your camera is not being used by
          another application.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-xl font-bold mb-2 text-center text-red-500">
          {error}
        </h2>
        <p className="text-center mb-6 max-w-md text-slate-300">
          AR navigation requires camera access to function properly. Please
          check your browser settings and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              setHasPermission(null);
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
            Use Basic Mode
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Camera permission denied
  if (hasPermission === false) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <Camera className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-xl font-bold mb-2 text-center">
          Camera Access Required
        </h2>
        <p className="text-center mb-6 max-w-md">
          Please enable camera permissions in your browser settings to use the
          AR navigation feature.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              setHasPermission(null);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Basic Mode
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Orientation permission denied (iOS)
  if (hasOrientationPermission === false) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <Compass className="h-16 w-16 text-blue-500 mb-6" />
        <h2 className="text-xl font-bold mb-2 text-center">
          Orientation Access Required
        </h2>
        <p className="text-center mb-6 max-w-md">
          AR navigation requires access to your device's orientation sensors to
          show directional guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={requestOrientationPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Allow Device Orientation
          </Button>
          <Button
            onClick={() => {
              setHasOrientationPermission(true);
              setUseFallbackMode(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Use Basic Mode
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
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
            Basic Navigation Mode
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

          {/* Progress Bar */}
          <div className="mt-3 mb-1">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Evacuation Progress</span>
              <span>{Math.round(evacuationProgress)}%</span>
            </div>
            <Progress value={evacuationProgress} className="h-2" />
          </div>
        </div>

        {/* Exit Button */}
        <div className="absolute right-4 top-4 z-10">
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

        {/* Action buttons */}
        <div className="absolute right-4 top-14 z-10 flex flex-col gap-2">
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

  // Main AR view
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-black">
      {/* Camera view */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* Canvas overlay for AR elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
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

          {/* Waypoint reached notification */}
          <AnimatePresence>
            {showWaypointReached && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/3 left-0 right-0 text-center"
              >
                <div className="bg-green-500/80 mx-auto py-2 px-4 rounded-lg inline-flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    Waypoint reached!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Waypoints visualization */}
        {showDirections && waypoints.length > 0 && (
          <div className="absolute left-0 right-0 top-1/2 flex justify-center items-center">
            <div className="relative h-1 bg-white/20 w-3/4 rounded-full overflow-hidden">
              {waypoints.map((waypoint, index) => (
                <div
                  key={waypoint.id}
                  className={`absolute w-6 h-6 -mt-2.5 rounded-full flex items-center justify-center
                    ${
                      index === currentWaypoint
                        ? "bg-blue-500 border-2 border-white"
                        : waypoint.reached
                        ? "bg-green-500"
                        : "bg-white/50"
                    }`}
                  style={{
                    left: `${(index / (waypoints.length - 1)) * 100}%`,
                  }}
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
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white">
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

        {/* Safety Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="mb-1 text-lg font-bold">EVACUATION ROUTE</p>
          <div className="flex justify-between items-center">
            <p className="text-sm">
              Current Waypoint: {currentWaypoint + 1} of {waypoints.length}
            </p>
            <div className="rounded-full bg-white/20 px-2 py-1 text-sm">
              <span className="font-medium">{distance}</span> from hazard
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 mb-1">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Evacuation Progress</span>
              <span>{Math.round(evacuationProgress)}%</span>
            </div>
            <Progress value={evacuationProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 pointer-events-auto">
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
