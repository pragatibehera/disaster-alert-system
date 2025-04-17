"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowUpCircle,
  MapPin,
  AlertTriangle,
  Compass,
  Navigation,
  Target,
  ChevronLeft,
  Camera,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface MobileARNavigatorProps {
  disaster: {
    type: string;
    location: string;
    severity: string;
    coordinates?: { lat: number; lng: number };
  };
  onClose: () => void;
}

export function MobileARNavigator({
  disaster,
  onClose,
}: MobileARNavigatorProps) {
  // Refs for video and canvas
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // State for AR setup
  const [stage, setStage] = useState<
    | "intro"
    | "requesting-permissions"
    | "ar-active"
    | "error"
    | "complete"
    | "ar-view"
    | "evacuation-complete"
  >("intro");
  const [error, setError] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [evacuationProgress, setEvacuationProgress] = useState(0);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [showWaypointReached, setShowWaypointReached] = useState(false);
  const [simulationInterval, setSimulationInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [waypointProgressInterval, setWaypointProgressInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [showARView, setShowARView] = useState(false);

  // Add geolocation state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "requesting" | "unavailable"
  >("requesting");
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Add state for animation effects
  const [cameraShake, setCameraShake] = useState({ x: 0, y: 0 });
  const [movementProgress, setMovementProgress] = useState(0);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const movementAnimationRef = useRef<number | null>(null);

  // Add state for demo marker movement
  const [demoPath, setDemoPath] = useState<Array<{ lat: number; lng: number }>>(
    []
  );
  const [demoPathIndex, setDemoPathIndex] = useState(0);
  const [showDemoPath, setShowDemoPath] = useState(false);
  const demoMovementRef = useRef<NodeJS.Timeout | null>(null);

  // Generate mock waypoints for demo purposes
  useEffect(() => {
    const points = generateMockWaypoints(5);
    setWaypoints(points);

    // Generate a demo path for marker movement
    generateDemoPath();

    // Check if user requested simulation mode
    const useSimulation =
      sessionStorage.getItem("useSimulationMode") === "true";
    if (useSimulation && stage === "intro") {
      console.log("Auto-starting simulation mode from session storage flag");
      // Start in simulation mode automatically
      setTimeout(() => {
        startSimulationMode();
      }, 500);
    }
  }, []);

  // Function to generate mock waypoints
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

  // Function to generate a demo path for the marker
  const generateDemoPath = () => {
    // Start from a base location (for demo purposes)
    const baseLat = 37.7749; // San Francisco
    const baseLng = -122.4194;

    // Create a winding path with 30 points
    const path = [];

    // Add starting point
    path.push({ lat: baseLat, lng: baseLng });

    // Generate points in a somewhat realistic pattern
    let currentLat = baseLat;
    let currentLng = baseLng;

    // Movement parameters
    const maxSegments = 30;
    const stepSize = 0.0008; // Approximately 50-100 meters per step

    // Create movement direction that avoids the disaster
    let directionAngle = disaster.coordinates
      ? (calculateBearing(
          { lat: baseLat, lng: baseLng },
          disaster.coordinates
        ) +
          180) %
        360 // Go directly away from disaster
      : Math.random() * 360; // Random direction if no disaster coordinates

    for (let i = 0; i < maxSegments; i++) {
      // Add some randomness to the direction
      directionAngle += Math.random() * 40 - 20;

      // Calculate new position
      const angleRad = toRadians(directionAngle);
      currentLat += Math.cos(angleRad) * stepSize;
      currentLng += Math.sin(angleRad) * stepSize;

      // Add this point to path
      path.push({
        lat: currentLat,
        lng: currentLng,
      });
    }

    setDemoPath(path);
  };

  // Function to animate marker movement along demo path
  const startDemoMarkerMovement = () => {
    // Clear any existing interval
    if (demoMovementRef.current) {
      clearInterval(demoMovementRef.current);
    }

    setShowDemoPath(true);
    setDemoPathIndex(0);

    // Start moving the marker
    demoMovementRef.current = setInterval(() => {
      setDemoPathIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // If we reached the end of the path
        if (nextIndex >= demoPath.length) {
          // Stop the interval
          if (demoMovementRef.current) {
            clearInterval(demoMovementRef.current);
            demoMovementRef.current = null;
          }

          // Return the last index
          return demoPath.length - 1;
        }

        // Update user location to show movement
        const nextPoint = demoPath[nextIndex];
        setUserLocation(nextPoint);

        // If we have disaster coordinates, update waypoints based on new location
        if (disaster.coordinates) {
          updateWaypointsBasedOnLocation(nextPoint, disaster.coordinates);
        }

        // Calculate progress based on path position
        const newProgress = (nextIndex / (demoPath.length - 1)) * 100;
        setEvacuationProgress(newProgress);

        // Trigger waypoint reached events at certain progress points
        if (newProgress > (currentWaypoint + 1) * 20 && currentWaypoint < 4) {
          // Show waypoint reached notification
          setShowWaypointReached(true);

          // Update waypoint status
          setWaypoints((prev) => {
            const updated = [...prev];
            updated[currentWaypoint] = {
              ...updated[currentWaypoint],
              reached: true,
            };
            return updated;
          });

          // Notify user of waypoint reached
          toast({
            title: `Waypoint ${currentWaypoint + 1} reached!`,
            description:
              currentWaypoint === waypoints.length - 2
                ? "Almost there! Final exit point ahead."
                : "Continue following the arrow to the next waypoint.",
            variant: "default",
          });

          // After a delay, hide the notification and move to next waypoint
          setTimeout(() => {
            setShowWaypointReached(false);
            setCurrentWaypoint((prev) => prev + 1);
          }, 3000);
        }

        // If we're at >95% progress, show evacuation complete
        if (newProgress > 95) {
          setStage("evacuation-complete");
        }

        return nextIndex;
      });
    }, 1000); // Move every second for demo purposes
  };

  // Function to start location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setLocationPermission("unavailable");
      toast({
        title: "Location Unavailable",
        description:
          "Your device doesn't support geolocation. Using simulated location instead.",
        variant: "default",
      });
      return;
    }

    setLocationPermission("requesting");

    try {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            console.log("Position received:", position);
            if (!position || !position.coords) {
              throw new Error("Invalid position data");
            }

            const coords = position.coords;
            if (
              !coords.latitude ||
              !coords.longitude ||
              isNaN(coords.latitude) ||
              isNaN(coords.longitude)
            ) {
              throw new Error("Invalid coordinates");
            }

            setUserLocation({
              lat: coords.latitude,
              lng: coords.longitude,
            });
            setLocationPermission("granted");

            // Start watching position for real-time updates
            try {
              const watchId = navigator.geolocation.watchPosition(
                (updatedPosition) => {
                  try {
                    console.log("Position update received");
                    if (!updatedPosition || !updatedPosition.coords) {
                      console.error("Invalid updated position data");
                      return;
                    }

                    const coords = updatedPosition.coords;
                    if (
                      !coords.latitude ||
                      !coords.longitude ||
                      isNaN(coords.latitude) ||
                      isNaN(coords.longitude)
                    ) {
                      console.error("Invalid updated coordinates");
                      return;
                    }

                    setUserLocation({
                      lat: coords.latitude,
                      lng: coords.longitude,
                    });

                    // Update waypoints relative to the user's new position if disaster coordinates exist
                    if (disaster.coordinates) {
                      updateWaypointsBasedOnLocation(
                        { lat: coords.latitude, lng: coords.longitude },
                        disaster.coordinates
                      );
                    }
                  } catch (updateError) {
                    console.error(
                      "Error processing position update:",
                      updateError
                    );
                  }
                },
                (error) => {
                  console.error("Watch position error:", error);
                  handleGeolocationError(error);
                },
                {
                  enableHighAccuracy: true,
                  maximumAge: 15000,
                  timeout: 10000,
                }
              );

              setLocationWatchId(watchId);
            } catch (watchError) {
              console.error("Error setting up watch position:", watchError);
            }
          } catch (positionError) {
            console.error("Error processing initial position:", positionError);
            handleGeolocationError(positionError);
          }
        },
        (error) => {
          console.error("Get current position error:", error);
          handleGeolocationError(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );
    } catch (geoError) {
      console.error("Geolocation API error:", geoError);
      handleGeolocationError(geoError);
    }
  };

  // Handle geolocation errors and ensure demo still works
  const handleGeolocationError = (
    error: GeolocationPositionError | Error | unknown
  ) => {
    console.error("Geolocation error:", error);

    let errorMessage =
      "Could not track your location. Using simulated position.";
    let permissionStatus: "denied" | "unavailable" = "unavailable";

    if (error && typeof error === "object" && "code" in error) {
      // This is a GeolocationPositionError
      const geoError = error as GeolocationPositionError;
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = "Location access was denied. Using demo path instead.";
          permissionStatus = "denied";
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage =
            "Location information is unavailable. Using demo path instead.";
          break;
        case geoError.TIMEOUT:
          errorMessage = "Location request timed out. Using demo path instead.";
          break;
        default:
          errorMessage = "Unknown geolocation error. Using demo path instead.";
      }
    }

    setLocationPermission(permissionStatus);

    toast({
      title: "Using Demo Mode",
      description: errorMessage,
      variant: "default",
    });

    // Ensure the demo path is shown regardless of location errors
    if (!showDemoPath) {
      // If demo path movement hasn't started yet, start it now as a fallback
      startDemoMarkerMovement();
    }
  };

  // Function to update waypoints based on user's real location
  const updateWaypointsBasedOnLocation = (
    userLocation: { lat: number; lng: number },
    disasterLocation: { lat: number; lng: number }
  ) => {
    try {
      // Validate coordinates before proceeding
      if (
        !isValidCoordinates(userLocation) ||
        !isValidCoordinates(disasterLocation)
      ) {
        console.error("Invalid coordinates for waypoint calculation", {
          userLocation,
          disasterLocation,
        });
        return;
      }

      // Calculate bearing between user and disaster
      const bearing = calculateBearing(userLocation, disasterLocation);

      // Calculate safe direction (away from disaster)
      const safeDirection = (bearing + 180) % 360;

      // Generate new waypoints leading away from the disaster
      const newWaypoints = [];
      let lastBearing = safeDirection + (Math.random() * 40 - 20); // Add some randomness

      for (let i = 0; i < 5; i++) {
        lastBearing += Math.random() * 40 - 20; // random turns
        const distance = 100 + i * 50 + Math.random() * 30;

        newWaypoints.push({
          id: `waypoint-${i}`,
          distance: distance,
          bearing: lastBearing,
          reached: i < currentWaypoint,
        });
      }

      setWaypoints(newWaypoints);
    } catch (error) {
      console.error("Error updating waypoints:", error);
      // If there's an error, we'll keep using the existing waypoints
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinates = (coords: {
    lat: number;
    lng: number;
  }): boolean => {
    return (
      coords !== null &&
      typeof coords === "object" &&
      "lat" in coords &&
      "lng" in coords &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng) &&
      isFinite(coords.lat) &&
      isFinite(coords.lng) &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180
    );
  };

  // Helper function to calculate bearing between two coordinates
  const calculateBearing = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      if (!isValidCoordinates(start) || !isValidCoordinates(end)) {
        throw new Error("Invalid coordinates for bearing calculation");
      }

      const startLat = toRadians(start.lat);
      const startLng = toRadians(start.lng);
      const endLat = toRadians(end.lat);
      const endLng = toRadians(end.lng);

      const y = Math.sin(endLng - startLng) * Math.cos(endLat);
      const x =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

      let bearing = Math.atan2(y, x);
      bearing = toDegrees(bearing);
      return (bearing + 360) % 360; // Normalize to 0-360
    } catch (error) {
      console.error("Error calculating bearing:", error);
      return 0; // Default bearing if calculation fails
    }
  };

  // Convert degrees to radians
  const toRadians = (degrees: number) => {
    return degrees * (Math.PI / 180);
  };

  // Convert radians to degrees
  const toDegrees = (radians: number) => {
    return radians * (180 / Math.PI);
  };

  // Function to animate movement in the simulation
  const animateMovement = () => {
    // Cancel any existing animation
    if (movementAnimationRef.current) {
      cancelAnimationFrame(movementAnimationRef.current);
    }

    let lastTimestamp = 0;
    let walkCycle = 0;

    const simulateWalkingMotion = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Update walking cycle - controls the bobbing/swaying effect
      walkCycle += elapsed * 0.005;

      // Calculate camera shake based on walking motion (subtle bobbing effect)
      const newShakeX = Math.sin(walkCycle * 2) * 1.5;
      const newShakeY = Math.abs(Math.sin(walkCycle)) * 1.2;
      setCameraShake({ x: newShakeX, y: newShakeY });

      // Update movement progress
      setMovementProgress((prev) => {
        // Slow, natural movement towards the next waypoint
        const newProgress = prev + elapsed * 0.01;

        // Move background slightly in the opposite direction of travel to create parallax effect
        const directionX = Math.cos(
          ((compassHeading + waypoints[currentWaypoint]?.bearing || 0) *
            Math.PI) /
            180
        );
        const directionY = Math.sin(
          ((compassHeading + waypoints[currentWaypoint]?.bearing || 0) *
            Math.PI) /
            180
        );

        setMapPosition((prevPos) => ({
          x: prevPos.x - directionX * elapsed * 0.01,
          y: prevPos.y - directionY * elapsed * 0.01,
        }));

        return newProgress % 100;
      });

      // Continue animation loop
      movementAnimationRef.current = requestAnimationFrame(
        simulateWalkingMotion
      );
    };

    // Start the animation loop
    movementAnimationRef.current = requestAnimationFrame(simulateWalkingMotion);
  };

  // Function to start simulation mode with enhanced resilience
  const startSimulationMode = () => {
    // Clear any existing intervals
    if (simulationInterval) clearInterval(simulationInterval);
    if (waypointProgressInterval) clearInterval(waypointProgressInterval);
    if (demoMovementRef.current) clearInterval(demoMovementRef.current);

    // Set initial simulation values
    setCompassHeading(45);
    setShowARView(true);
    setStage("ar-view");

    // Start the demo path movement - this will work regardless of location permissions
    startDemoMarkerMovement();

    // Try to get user's real location, but the demo will work whether this succeeds or fails
    try {
      startLocationTracking();
    } catch (error) {
      console.error("Error starting location tracking:", error);
      // Demo will continue to work with the fallback path
    }

    // Start movement animation
    animateMovement();

    // Create animation effect for compass heading
    setSimulationInterval(
      setInterval(() => {
        setCompassHeading((prevHeading) => {
          // Simulate slight variations in heading to make it look more realistic
          const variation = Math.random() * 10 - 5;
          return (prevHeading + variation + 360) % 360;
        });
      }, 100)
    );
  };

  // Set up device orientation for compass
  useEffect(() => {
    if (stage !== "ar-active") return;

    // Function to handle orientation events
    function handleOrientation(event: DeviceOrientationEvent) {
      // Different browsers and devices provide orientation data differently
      // Try multiple properties in order of preference
      if (event.alpha !== null && event.alpha !== undefined) {
        // Alpha is the compass direction the device is facing (0-360)
        setCompassHeading(event.alpha);
      } else if (
        // Some Android devices use webkitCompassHeading (0-360, iOS Safari)
        "webkitCompassHeading" in event &&
        (event as any).webkitCompassHeading !== null &&
        (event as any).webkitCompassHeading !== undefined
      ) {
        setCompassHeading((event as any).webkitCompassHeading);
      } else if (
        // Handle absolute orientation if available
        "absolute" in event &&
        (event as any).absolute === true &&
        event.beta !== null &&
        event.gamma !== null
      ) {
        // Attempt to calculate heading from beta and gamma if absolute orientation is available
        // This is a fallback and less accurate
        const beta = event.beta; // -180 to 180 (front-back tilt)
        const gamma = event.gamma; // -90 to 90 (left-right tilt)

        // Simple approximation for heading when device is held upright
        // This is not perfect but can provide some directional feedback
        const heading = Math.atan2(gamma || 0, beta || 0) * (180 / Math.PI);
        setCompassHeading((heading + 360) % 360);
      }
    }

    // Handle iOS 13+ permission requirements
    async function setupOrientationTracking() {
      try {
        // For iOS 13+ devices that require permission
        if (
          typeof window !== "undefined" &&
          window.DeviceOrientationEvent &&
          typeof (DeviceOrientationEvent as any).requestPermission ===
            "function"
        ) {
          try {
            const permissionState = await (
              DeviceOrientationEvent as any
            ).requestPermission();

            if (permissionState === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            } else {
              console.log("DeviceOrientation permission denied");
              toast({
                title: "Permission Denied",
                description:
                  "Orientation sensors are needed for AR navigation.",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error("iOS orientation permission error:", err);
            // Continue anyway, as many devices will work without explicit permission
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } else {
          // For non-iOS devices or older iOS versions
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (err) {
        console.error("Error setting up orientation:", err);
        // Set up anyway - we'll use mock or fallback data if needed
        window.addEventListener("deviceorientation", handleOrientation);

        // If no orientation events fire after a timeout, use simulated data instead
        const timeoutId = setTimeout(() => {
          // Start a simulation interval if we haven't received any real sensor data
          const simulationInterval = setInterval(() => {
            // Simulate compass heading changing slowly
            setCompassHeading((prev) => (prev + 2) % 360);
          }, 100);

          return () => clearInterval(simulationInterval);
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    }

    setupOrientationTracking();

    // Simulate evacuation progress increase for demo
    const progressInterval = setInterval(() => {
      setEvacuationProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 2, 100);
        if (newProgress === 100 && prev !== 100) {
          setStage("complete");
        }
        return newProgress;
      });
    }, 3000);

    // Simulate waypoint reached after intervals
    const waypointInterval = setInterval(() => {
      if (currentWaypoint < waypoints.length - 1) {
        setShowWaypointReached(true);
        setWaypoints((prev) => {
          const updated = [...prev];
          updated[currentWaypoint] = {
            ...updated[currentWaypoint],
            reached: true,
          };
          return updated;
        });

        setTimeout(() => {
          setShowWaypointReached(false);
          setCurrentWaypoint((prev) => prev + 1);
        }, 3000);
      }
    }, 15000);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearInterval(progressInterval);
      clearInterval(waypointInterval);
    };
  }, [stage, currentWaypoint, waypoints.length]);

  // Handle camera setup
  const setupCamera = async () => {
    if (!videoRef.current) return;

    try {
      setStage("requesting-permissions");

      // Check if running over HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext) {
        console.warn(
          "Not running in a secure context - camera may not work on some devices"
        );
        toast({
          title: "Security Warning",
          description:
            "Camera access may not work because the site isn't running on HTTPS. Try using a production URL.",
          variant: "destructive",
        });
      }

      // First check if the browser has camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support camera access. Try using Chrome or Safari."
        );
      }

      // Try with ideal resolution first, but with fallbacks
      let stream;

      // Try multiple approaches in sequence
      try {
        // First attempt with environment facing camera (back camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
          },
          audio: false,
        });
      } catch (initialErr) {
        console.warn(
          "Initial camera request failed, trying without facingMode:",
          initialErr
        );

        // Try without specifying facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: window.innerWidth },
              height: { ideal: window.innerHeight },
            },
            audio: false,
          });
        } catch (secondErr) {
          console.warn(
            "Second camera request failed, trying simpler constraints:",
            secondErr
          );

          // Try with minimal constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      // Handle if somehow stream is still undefined
      if (!stream) {
        throw new Error(
          "Could not get camera stream despite multiple attempts"
        );
      }

      streamRef.current = stream;
      console.log("Camera stream obtained successfully");

      // Connect the stream to video element
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          console.log("Video metadata loaded, attempting to play");

          // Add play() error handling
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video playing successfully");
                // Start AR rendering
                startARRendering();
                setStage("ar-active");
              })
              .catch((err) => {
                console.error("Error playing video:", err);

                // Special handling for "play() failed because the user didn't interact with the document first"
                if (err.name === "NotAllowedError") {
                  setError(
                    "Interaction required to play video. Please tap the screen and try again."
                  );
                } else {
                  setError("Could not start camera preview: " + err.message);
                }

                setStage("error");
              });
          }
        }
      };

      // Add error handler for video element
      if (videoRef.current) {
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          setError(
            "Video element error: " + (e as any).target?.error?.message ||
              "Unknown error"
          );
          setStage("error");
        };
      }
    } catch (err: any) {
      console.error("Camera setup error:", err);

      let errorMessage = "Failed to access camera";

      if (err.name === "NotAllowedError") {
        errorMessage =
          "Camera access was denied. Please allow camera permissions and reload the page.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found on your device.";
      } else if (err.name === "NotReadableError") {
        errorMessage =
          "Camera is in use by another application. Please close other apps that might be using your camera.";
      } else if (err.name === "AbortError") {
        errorMessage = "Camera access was aborted. Please try again.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage =
          "Camera constraints not supported. We'll try with basic settings.";
      } else if (err.name === "SecurityError") {
        errorMessage =
          "Camera access blocked for security reasons. Make sure you're on HTTPS.";
      } else if (err.name === "TypeError") {
        errorMessage =
          "Your browser does not support the requested camera features.";
      } else {
        // Use the actual error message
        errorMessage = `Camera error: ${err.message || "Unknown error"}`;
      }

      // Try one more time with minimal constraints as a last resort
      if (
        err.name === "AbortError" ||
        err.name === "OverconstrainedError" ||
        err.name === "NotReadableError"
      ) {
        try {
          console.log(
            "Trying one last attempt with minimal camera constraints"
          );
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

          streamRef.current = basicStream;
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current
                  .play()
                  .then(() => {
                    startARRendering();
                    setStage("ar-active");
                  })
                  .catch((playErr) => {
                    console.error(
                      "Error playing video with basic constraints:",
                      playErr
                    );
                    setError(
                      "Could not start camera preview after multiple attempts. Please try reloading the page."
                    );
                    setStage("error");
                  });
              }
            };
            return; // Exit if this worked
          }
        } catch (fallbackErr) {
          console.error("Fallback camera attempt failed:", fallbackErr);
        }
      }

      setError(errorMessage);
      setStage("error");
    }
  };

  // Start AR rendering - draw on canvas over video
  const startARRendering = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const renderFrame = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas size to video
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw AR elements
      drawARElements(ctx, canvas.width, canvas.height);

      // Continue rendering
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  };

  // Draw AR elements on canvas
  const drawARElements = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw direction arrow
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const arrowSize = Math.min(width, height) * 0.2;

    // Calculate arrow rotation based on compass heading and waypoint bearing
    const currentBearing = waypoints[currentWaypoint]?.bearing || 0;
    const arrowRotation = (compassHeading + currentBearing) % 360;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((arrowRotation * Math.PI) / 180);

    // Draw arrow
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)"; // Red with transparency
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize);
    ctx.lineTo(arrowSize / 2, arrowSize / 2);
    ctx.lineTo(0, arrowSize / 4);
    ctx.lineTo(-arrowSize / 2, arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    // Draw circle at arrow center
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, 0, arrowSize / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw waypoint indicator at the bottom
    const waypointY = height - 100;

    // Draw dots for each waypoint
    const dotSpacing = 20;
    const dotsWidth = (waypoints.length - 1) * dotSpacing;
    const dotsStartX = centerX - dotsWidth / 2;

    for (let i = 0; i < waypoints.length; i++) {
      const dotX = dotsStartX + i * dotSpacing;

      ctx.beginPath();
      if (i === currentWaypoint) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Current waypoint (red)
        ctx.arc(dotX, waypointY, 8, 0, Math.PI * 2);
      } else if (waypoints[i].reached) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.9)"; // Reached waypoint (green)
        ctx.arc(dotX, waypointY, 6, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Future waypoint (white)
        ctx.arc(dotX, waypointY, 6, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Draw distance to current waypoint
    ctx.fillStyle = "white";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${waypoints[currentWaypoint]?.distance?.toFixed(0)}m to next waypoint`,
      centerX,
      waypointY + 25
    );
  };

  // Stop camera and clean up resources
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();

      // Clear location tracking
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }

      // Clear simulation intervals
      if (simulationInterval) clearInterval(simulationInterval);
      if (waypointProgressInterval) clearInterval(waypointProgressInterval);
      if (demoMovementRef.current) clearInterval(demoMovementRef.current);

      // Clear movement animation
      if (movementAnimationRef.current) {
        cancelAnimationFrame(movementAnimationRef.current);
      }
    };
  }, [simulationInterval, waypointProgressInterval, locationWatchId]);

  // Render intro screen with instructions
  if (stage === "intro") {
    return (
      <div className="relative flex min-h-[85vh] w-full flex-col items-center bg-black text-white p-4">
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

        <div className="text-center my-8">
          <h2 className="text-2xl font-bold mb-2">AR Navigation</h2>
          <p className="text-slate-300">
            Follow augmented reality guidance to navigate away from the{" "}
            {disaster.type.toLowerCase()} area
          </p>
        </div>

        <div className="space-y-4 w-full max-w-md mb-8">
          <div className="bg-slate-800/70 p-4 rounded-lg flex">
            <div className="bg-red-500/20 p-2 rounded-full mr-3">
              <Camera className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium">Camera Access Required</h3>
              <p className="text-sm text-slate-300">
                We'll need to use your camera to show AR navigation
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-lg flex">
            <div className="bg-blue-500/20 p-2 rounded-full mr-3">
              <Compass className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Hold Phone Upright</h3>
              <p className="text-sm text-slate-300">
                Point your phone in different directions to see the evacuation
                route
              </p>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-lg flex">
            <div className="bg-amber-500/20 p-2 rounded-full mr-3">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium">Follow the Arrows</h3>
              <p className="text-sm text-slate-300">
                Move in the direction of the arrows to reach safety
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            console.log("Start AR button clicked");
            setupCamera();
          }}
          className="w-full max-w-md bg-red-600 hover:bg-red-700 mb-4"
          size="lg"
        >
          <Navigation className="mr-2 h-5 w-5" />
          Start AR Navigation
        </Button>

        <Button
          onClick={() => {
            console.log("Starting demo mode");
            startSimulationMode();
          }}
          variant="outline"
          className="w-full max-w-md text-white border-white/30"
          size="lg"
        >
          <Camera className="mr-2 h-5 w-5" />
          Use Demo Mode (No Camera)
        </Button>
      </div>
    );
  }

  // Render permissions request screen
  if (stage === "requesting-permissions") {
    return (
      <div className="flex min-h-[85vh] w-full flex-col items-center justify-center bg-black p-6">
        <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-red-500 animate-spin mb-8"></div>
        <h2 className="text-xl font-bold mb-2 text-white text-center">
          Requesting Camera Access
        </h2>
        <p className="text-center text-sm text-slate-300 mb-8 max-w-md">
          Please allow access to your camera when prompted by your browser
        </p>
      </div>
    );
  }

  // Render error screen
  if (stage === "error") {
    return (
      <div className="flex min-h-[85vh] w-full flex-col items-center justify-center bg-black p-6">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-xl font-bold mb-2 text-white text-center">
          {error || "Could not start AR navigation"}
        </h2>

        {/* Technical error details for debugging */}
        <div className="mb-4 p-2 max-w-md w-full bg-slate-900 rounded text-xs text-white/60 overflow-auto">
          <p>Error details: {JSON.stringify(error)}</p>
          <p>Browser: {navigator.userAgent}</p>
          <p>Secure context: {window.isSecureContext ? "Yes" : "No"}</p>
          <p>
            Media devices:{" "}
            {navigator.mediaDevices ? "Available" : "Not available"}
          </p>
        </div>

        <p className="text-center text-white/70 mb-6 max-w-md">
          Try the following troubleshooting steps:
        </p>

        <div className="bg-white/10 rounded-lg p-4 mb-6 max-w-md w-full">
          <ul className="space-y-3 text-white/80 text-sm list-disc pl-5">
            <li>
              Ensure camera permissions are allowed in your browser settings
            </li>
            <li>Try using Chrome or Safari for best compatibility</li>
            <li>Make sure no other apps are using your camera</li>
            <li>
              Some devices require HTTPS for camera access (not localhost)
            </li>
            <li>Try closing other browser tabs and reloading</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-md">
          <Button
            onClick={setupCamera}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>

          <Button
            onClick={() => {
              startSimulationMode();
            }}
            variant="outline"
            className="border-white/30 text-white"
          >
            Use Demo Mode (No Camera)
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white"
          >
            Return to Map
          </Button>
        </div>
      </div>
    );
  }

  // Render evacuation complete screen
  if (stage === "complete" || stage === "evacuation-complete") {
    return (
      <div className="flex min-h-[85vh] w-full flex-col items-center justify-center bg-black p-6">
        <div className="bg-green-500/20 p-6 rounded-full mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-white text-center">
          Evacuation Complete
        </h2>
        <p className="text-center text-white/70 mb-8 max-w-md">
          You have successfully navigated to a safe area away from the{" "}
          {disaster.type.toLowerCase()}
        </p>
        <Button
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Render AR view with enhanced movement
  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black">
      {/* Video stream */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
      />

      {/* Fallback background if camera isn't available */}
      {!streamRef.current && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black"
          style={{
            transform: `translate(${cameraShake.x}px, ${cameraShake.y}px)`,
          }}
        >
          {/* Simulated environment background for demo mode */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div
              className="absolute inset-0 bg-slate-800"
              style={{
                transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
              }}
            >
              {/* Simulated roads */}
              <div className="absolute top-1/2 left-0 right-0 h-16 bg-slate-600 transform -translate-y-1/2"></div>
              <div className="absolute top-0 bottom-0 left-1/3 w-16 bg-slate-600"></div>
              <div className="absolute bottom-0 right-0 h-1/3 w-16 bg-slate-600"></div>

              {/* Simulated buildings */}
              <div className="absolute top-[10%] left-[10%] w-[15%] h-[20%] bg-slate-700 rounded"></div>
              <div className="absolute top-[15%] left-[30%] w-[10%] h-[15%] bg-slate-700 rounded"></div>
              <div className="absolute top-[60%] left-[20%] w-[12%] h-[25%] bg-slate-700 rounded"></div>
              <div className="absolute top-[5%] right-[15%] w-[18%] h-[22%] bg-slate-700 rounded"></div>
              <div className="absolute top-[65%] right-[10%] w-[14%] h-[18%] bg-slate-700 rounded"></div>

              {/* Simulated trees */}
              <div className="absolute top-[35%] left-[8%] w-8 h-8 rounded-full bg-green-800"></div>
              <div className="absolute top-[42%] left-[12%] w-6 h-6 rounded-full bg-green-800"></div>
              <div className="absolute top-[30%] left-[70%] w-8 h-8 rounded-full bg-green-800"></div>
              <div className="absolute top-[75%] left-[60%] w-7 h-7 rounded-full bg-green-800"></div>
              <div className="absolute top-[20%] right-[5%] w-6 h-6 rounded-full bg-green-800"></div>
              <div className="absolute top-[80%] right-[25%] w-8 h-8 rounded-full bg-green-800"></div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas overlay for AR elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          transform: !streamRef.current
            ? `translate(${cameraShake.x}px, ${cameraShake.y}px)`
            : "none",
        }}
      />

      {/* Footstep sound and vibration visualizer */}
      {!streamRef.current && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 h-1 w-16">
          <div
            className="bg-white/40 h-full rounded-full"
            style={{
              width: `${10 + Math.abs(Math.sin(movementProgress * 0.2) * 90)}%`,
              opacity: 0.2 + Math.abs(Math.sin(movementProgress * 0.2)) * 0.8,
            }}
          ></div>
        </div>
      )}

      {/* Simulation mode indicator */}
      {!streamRef.current && (
        <>
          <div className="absolute top-16 inset-x-0 mx-auto px-4 py-2 bg-black/60 text-white text-sm text-center max-w-xs rounded-full">
            <span className="animate-pulse">
              {demoPathIndex > 0
                ? "Demo Path Active - Moving Marker"
                : locationPermission === "granted"
                ? "Demo Mode with Real Location"
                : "Demo Mode Active"}
            </span>
          </div>

          {/* Active path indicator */}
          {demoPathIndex > 0 && (
            <div className="absolute top-28 inset-x-0 mx-auto px-4 py-2 bg-green-500/60 text-white text-xs text-center max-w-xs rounded-full">
              <span>
                Path Progress:{" "}
                {Math.min(
                  Math.round((demoPathIndex / (demoPath.length - 1)) * 100),
                  100
                )}
                %
              </span>
            </div>
          )}

          {/* Location status indicator */}
          {locationPermission === "requesting" && (
            <div className="absolute top-28 inset-x-0 mx-auto px-4 py-2 bg-blue-500/60 text-white text-xs text-center max-w-xs rounded-full">
              <span className="flex items-center justify-center">
                <span className="h-2 w-2 bg-blue-100 rounded-full mr-2 animate-ping"></span>
                Requesting location access...
              </span>
            </div>
          )}

          {locationPermission === "granted" &&
            userLocation &&
            demoPathIndex === 0 && (
              <div className="absolute top-28 inset-x-0 mx-auto px-4 py-2 bg-green-500/60 text-white text-xs text-center max-w-xs rounded-full">
                <span>
                  Location: {userLocation.lat.toFixed(6)},{" "}
                  {userLocation.lng.toFixed(6)}
                </span>
              </div>
            )}

          {/* Demo mode navigation guidance text */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-32 text-center pointer-events-none">
            <div className="inline-block bg-black/60 px-4 py-2 rounded-lg text-white text-sm max-w-xs">
              {demoPathIndex > 0
                ? "Automatic evacuation in progress"
                : "Follow the red arrow to navigate to safety"}
            </div>
          </div>

          {/* Animated movement indicator */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: "none", // Override default animation
              transform: `translate(-50%, -50%) translate(${
                Math.sin(movementProgress * 0.2) * 3
              }px, ${Math.abs(Math.cos(movementProgress * 0.2) * 2)}px)`,
            }}
          >
            {/* If we're showing the demo path, render the current position based on the path */}
            {demoPathIndex > 0 && demoPathIndex < demoPath.length && (
              <div
                className="absolute h-6 w-6"
                style={{
                  // Calculate position based on distance from center
                  transform: `translate(${
                    (demoPath[demoPathIndex].lng - demoPath[0].lng) * 5000
                  }px, 
                               ${
                                 (demoPath[demoPathIndex].lat -
                                   demoPath[0].lat) *
                                 5000
                               }px)`,
                  zIndex: 10,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white animate-pulse"></div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-10 flex items-end overflow-hidden">
                  <div className="w-full space-y-1 animate-bounce">
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-80"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-60"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-40"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Default marker if not showing demo path */}
            {(!showDemoPath || demoPathIndex === 0) && (
              <>
                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white"></div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-10 flex items-end overflow-hidden">
                  <div className="w-full space-y-1 animate-bounce">
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-80"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-60"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-300 opacity-40"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Simulated motion blur overlay */}
      {!streamRef.current && movementProgress > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${compassHeading}deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)`,
            opacity: 0.4 + Math.sin(movementProgress * 0.1) * 0.2,
          }}
        ></div>
      )}

      {/* Rest of the UI remains unchanged */}
      {/* UI overlay */}
      <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 border-white/20 text-white"
          onClick={onClose}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <Badge
          className={`${
            disaster.severity === "high"
              ? "bg-red-600"
              : disaster.severity === "medium"
              ? "bg-amber-600"
              : "bg-green-600"
          }`}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          {disaster.type} Alert
        </Badge>
      </div>

      {/* Evacuation progress */}
      <div className="absolute inset-x-0 top-16 px-4">
        <div className="mb-1 flex justify-between text-xs text-white">
          <span>Evacuation Progress</span>
          <span>{Math.round(evacuationProgress)}%</span>
        </div>
        <Progress value={evacuationProgress} className="h-1.5" />
      </div>

      {/* Waypoint reached notification */}
      <AnimatePresence>
        {showWaypointReached && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                       bg-green-600/90 text-white px-6 py-3 rounded-lg flex items-center"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Waypoint Reached!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info panel */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-black/0 pt-16">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-white/70">Current Waypoint</div>
            <div className="text-white font-medium">
              {currentWaypoint + 1} of {waypoints.length}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/70">Distance to Safety</div>
            <div className="text-white font-medium">
              {(
                waypoints.reduce(
                  (total, wp, i) =>
                    i >= currentWaypoint ? total + wp.distance : total,
                  0
                ) / 1000
              ).toFixed(1)}{" "}
              km
            </div>
          </div>
        </div>

        {/* Add steps counter to enhance realism */}
        {!streamRef.current && (
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-xs text-white/70">
            <div>Steps: {Math.floor(movementProgress * 7)}</div>
            <div>
              Pace: {Math.floor(3 + Math.sin(movementProgress * 0.2) * 0.8)}{" "}
              km/h
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
