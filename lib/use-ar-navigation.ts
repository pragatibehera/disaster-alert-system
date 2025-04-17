"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  checkARCapabilities,
  requestCameraAccess,
  requestOrientationPermission,
  getCurrentLocation,
  registerOrientationHandler,
  calculateDistance,
  calculateBearing,
  requestFullscreen,
  exitFullscreen,
} from "./ar-capabilities";

interface UseARNavigationProps {
  targetLocation?: { lat: number; lng: number };
  onWaypointReached?: (waypointIndex: number) => void;
  onEvacuationComplete?: () => void;
  waypointCount?: number;
  enableFullscreen?: boolean;
}

/**
 * Custom hook for AR-based navigation functionality
 */
export function useARNavigation({
  targetLocation,
  onWaypointReached,
  onEvacuationComplete,
  waypointCount = 5,
  enableFullscreen = false,
}: UseARNavigationProps = {}) {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Device capability state
  const [capabilities, setCapabilities] = useState<ReturnType<
    typeof checkARCapabilities
  > | null>(null);

  // Permission states
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");
  const [orientationPermission, setOrientationPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");

  // UI states
  const [mode, setMode] = useState<
    | "initializing"
    | "instructions"
    | "permissions"
    | "ar"
    | "fallback"
    | "error"
  >("initializing");
  const [error, setError] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Navigation states
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [evacuationProgress, setEvacuationProgress] = useState(0);
  const [distanceToSafety, setDistanceToSafety] = useState<number | null>(null);
  const [targetBearing, setTargetBearing] = useState<number | null>(null);

  // Waypoints
  const [waypoints, setWaypoints] = useState<
    {
      id: string;
      lat: number;
      lng: number;
      distance: number;
      bearing: number;
      reached: boolean;
    }[]
  >([]);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [showWaypointReached, setShowWaypointReached] = useState(false);

  // Location tracking interval
  const locationTrackingRef = useRef<number | null>(null);

  // Check device capabilities on mount
  useEffect(() => {
    const caps = checkARCapabilities();
    setCapabilities(caps);

    if (!caps.compatible) {
      setMode("fallback");
      if (caps.incompatibleReason) {
        setError(caps.incompatibleReason);
        toast({
          title: "AR Navigation Limited",
          description: caps.incompatibleReason,
          variant: "destructive",
        });
      }
    } else {
      setMode("instructions");
    }

    return () => {
      // Clean up
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (locationTrackingRef.current) {
        clearInterval(locationTrackingRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Generate mock or real waypoints
  useEffect(() => {
    if (!targetLocation) {
      generateMockWaypoints();
      return;
    }

    if (currentLocation) {
      generateRealWaypoints(currentLocation, targetLocation);
    }
  }, [currentLocation, targetLocation]);

  // Start location tracking
  useEffect(() => {
    if (mode !== "ar" && mode !== "fallback") return;

    const trackLocation = async () => {
      const result = await getCurrentLocation();
      if (result.success && result.position) {
        const { latitude, longitude } = result.position.coords;

        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });

        // Calculate distance to target if available
        if (targetLocation) {
          const distance = calculateDistance(
            latitude,
            longitude,
            targetLocation.lat,
            targetLocation.lng
          );
          setDistanceToSafety(distance);

          // Calculate bearing to target
          const bearing = calculateBearing(
            latitude,
            longitude,
            targetLocation.lat,
            targetLocation.lng
          );
          setTargetBearing(bearing);

          // Update evacuation progress based on distance
          // Assuming initial distance as 100%
          if (waypoints.length > 0) {
            const initialDistance = waypoints[0].distance;
            const progress = Math.min(
              100,
              Math.max(0, 100 - (distance / initialDistance) * 100)
            );
            setEvacuationProgress(progress);

            // Check if waypoint is reached
            checkWaypointReached(latitude, longitude);
          }
        }
      } else if (result.error) {
        console.warn("Location error:", result.error.message);
      }
    };

    // Run once immediately
    trackLocation();

    // Then set up tracking interval
    locationTrackingRef.current = window.setInterval(trackLocation, 3000);

    return () => {
      if (locationTrackingRef.current) {
        clearInterval(locationTrackingRef.current);
      }
    };
  }, [mode, targetLocation, waypoints]);

  // Set up device orientation for compass
  useEffect(() => {
    if (mode !== "ar" && mode !== "fallback") return;

    const cleanup = registerOrientationHandler((event) => {
      if (event.alpha !== null) {
        setCompassHeading(event.alpha);
      }
    });

    return cleanup;
  }, [mode]);

  // Request camera access when needed
  const setupCamera = useCallback(async () => {
    if (!videoRef.current) return false;

    try {
      // Request camera with environment facing (back camera)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
        },
        audio: false,
      };

      const result = await requestCameraAccess(constraints);

      if (result.success && result.stream) {
        streamRef.current = result.stream;

        // Connect the stream to video element
        videoRef.current.srcObject = result.stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setCameraPermission("granted");

                // Start AR rendering if we're using canvas overlay
                if (canvasRef.current) {
                  startARRendering();
                }

                return true;
              })
              .catch((err) => {
                console.error("Failed to play video:", err);
                setError(
                  "Camera initialization failed. Please reload and try again."
                );
                setCameraPermission("denied");
                setMode("error");
                return false;
              });
          }
        };
      } else {
        setError(result.error?.message || "Failed to access camera");
        setCameraPermission("denied");
        setMode("error");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected camera error:", err);
      setError("Camera access failed with an unexpected error");
      setCameraPermission("denied");
      setMode("error");
      return false;
    }
  }, []);

  // Start AR rendering on canvas
  const startARRendering = useCallback(() => {
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

      // Draw AR elements (arrows, indicators, etc.)
      drawARElements(ctx);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // Draw AR elements on canvas
  const drawARElements = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!canvasRef.current) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      // Draw direction arrow
      if (targetBearing !== null) {
        // Calculate arrow rotation based on compass and target bearing
        const arrowRotation = (targetBearing - compassHeading + 360) % 360;
        drawArrow(ctx, width / 2, height / 2, arrowRotation);
      }

      // Draw waypoints if visible
      if (showDirections) {
        drawWaypointIndicators(ctx, width, height);
      }

      // Draw evacuation progress
      drawProgressIndicator(ctx, width, height);
    },
    [targetBearing, compassHeading, showDirections]
  );

  // Draw directional arrow
  const drawArrow = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) => {
      const arrowSize = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.2;

      // Save context state
      ctx.save();

      // Translate to center
      ctx.translate(x, y);

      // Rotate context
      const radians = (rotation * Math.PI) / 180;
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
    },
    []
  );

  // Draw waypoint indicators
  const drawWaypointIndicators = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const lineY = height * 0.75;
      const lineWidth = width * 0.8;
      const startX = (width - lineWidth) / 2;

      // Draw timeline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 4;
      ctx.moveTo(startX, lineY);
      ctx.lineTo(startX + lineWidth, lineY);
      ctx.stroke();

      // Draw waypoints
      waypoints.forEach((waypoint, index) => {
        const x = startX + lineWidth * (index / (waypoints.length - 1));

        // Draw waypoint circle
        ctx.beginPath();
        ctx.arc(x, lineY, 12, 0, Math.PI * 2);

        if (index === currentWaypoint) {
          // Current waypoint
          ctx.fillStyle = "rgba(0, 122, 255, 0.8)";
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
        } else if (waypoint.reached) {
          // Reached waypoint
          ctx.fillStyle = "rgba(50, 205, 50, 0.8)";
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1;
        } else {
          // Future waypoint
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1;
        }

        ctx.fill();
        ctx.stroke();

        // Draw waypoint number
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((index + 1).toString(), x, lineY);

        // Animate current waypoint
        if (index === currentWaypoint) {
          // Pulse effect
          const now = Date.now();
          const pulse = 1 + 0.2 * Math.sin(now / 300);

          ctx.beginPath();
          ctx.arc(x, lineY, 16 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0, 122, 255, 0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    },
    [waypoints, currentWaypoint]
  );

  // Draw progress indicator
  const drawProgressIndicator = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const progressWidth = width * 0.8;
      const progressHeight = 8;
      const x = (width - progressWidth) / 2;
      const y = height * 0.85;

      // Draw background
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(x, y, progressWidth, progressHeight);

      // Draw progress
      ctx.fillStyle = "rgba(50, 205, 50, 0.8)";
      ctx.fillRect(
        x,
        y,
        progressWidth * (evacuationProgress / 100),
        progressHeight
      );

      // Draw percentage
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        `${Math.round(evacuationProgress)}%`,
        width / 2,
        y + progressHeight + 5
      );
    },
    [evacuationProgress]
  );

  // Check if a waypoint has been reached
  const checkWaypointReached = useCallback(
    (latitude: number, longitude: number) => {
      if (currentWaypoint >= waypoints.length) return;

      const currentWP = waypoints[currentWaypoint];
      if (currentWP.reached) return;

      // Calculate distance to current waypoint
      const distance = calculateDistance(
        latitude,
        longitude,
        currentWP.lat,
        currentWP.lng
      );

      // Waypoint is reached if within 20 meters
      if (distance < 20) {
        // Update waypoint status
        setWaypoints((prev) => {
          const updated = [...prev];
          updated[currentWaypoint] = {
            ...updated[currentWaypoint],
            reached: true,
          };
          return updated;
        });

        // Show reached notification
        setShowWaypointReached(true);
        setTimeout(() => setShowWaypointReached(false), 3000);

        // Call callback
        if (onWaypointReached) {
          onWaypointReached(currentWaypoint);
        }

        // Move to next waypoint
        if (currentWaypoint < waypoints.length - 1) {
          setCurrentWaypoint((prev) => prev + 1);
        } else {
          // Final waypoint reached
          if (onEvacuationComplete) {
            onEvacuationComplete();
          }
        }
      }
    },
    [waypoints, currentWaypoint, onWaypointReached, onEvacuationComplete]
  );

  // Generate mock waypoints when no real target is available
  const generateMockWaypoints = useCallback(() => {
    // Create random waypoints in a general direction
    const newWaypoints = [];
    const waypointCount = 5;
    let lastBearing = Math.random() * 360; // Random initial bearing

    // Get mock current location if real one isn't available
    const startLat = currentLocation?.lat || 37.7749;
    const startLng = currentLocation?.lng || -122.4194;

    for (let i = 0; i < waypointCount; i++) {
      // Adjust bearing slightly for each waypoint to create a path
      lastBearing += Math.random() * 40 - 20;

      // Distance increases with each waypoint (100-500 meters)
      const distance = 100 + i * 100 + Math.random() * 50;

      // Calculate waypoint position (simplified)
      // In a real app, you'd use proper geospatial calculations
      const lat =
        startLat +
        (Math.sin((lastBearing * Math.PI) / 180) * distance) / 111000;
      const lng =
        startLng +
        (Math.cos((lastBearing * Math.PI) / 180) * distance) /
          (111000 * Math.cos((startLat * Math.PI) / 180));

      newWaypoints.push({
        id: `waypoint-${i}`,
        lat,
        lng,
        distance,
        bearing: lastBearing,
        reached: false,
      });
    }

    setWaypoints(newWaypoints);
  }, [currentLocation]);

  // Generate real waypoints when we have a start and target location
  const generateRealWaypoints = useCallback(
    (
      start: { lat: number; lng: number },
      target: { lat: number; lng: number }
    ) => {
      // Calculate direct distance
      const directDistance = calculateDistance(
        start.lat,
        start.lng,
        target.lat,
        target.lng
      );
      const directBearing = calculateBearing(
        start.lat,
        start.lng,
        target.lat,
        target.lng
      );

      // Create waypoints along a path to the target
      const newWaypoints = [];
      const segments = waypointCount;

      for (let i = 0; i < segments; i++) {
        // Calculate fraction of the way to the target (0 to 1)
        const fraction = (i + 1) / segments;

        // Add some randomness to make path more natural (+/- 5%)
        const variableFraction = fraction * (1 + (Math.random() * 0.1 - 0.05));

        // Calculate waypoint position (linear interpolation with slight randomization)
        const lat = start.lat + (target.lat - start.lat) * variableFraction;
        const lng = start.lng + (target.lng - start.lng) * variableFraction;

        // Add some lateral variation (+/- 10% of total distance)
        const lateralVariation =
          ((Math.random() * 0.2 - 0.1) * directDistance) / 111000;
        const perpendicularBearing = (directBearing + 90) % 360;
        const adjustedLat =
          lat +
          lateralVariation * Math.sin((perpendicularBearing * Math.PI) / 180);
        const adjustedLng =
          lng +
          (lateralVariation *
            Math.cos((perpendicularBearing * Math.PI) / 180)) /
            Math.cos((lat * Math.PI) / 180);

        // Calculate actual distance and bearing from start
        const distance = calculateDistance(
          start.lat,
          start.lng,
          adjustedLat,
          adjustedLng
        );
        const bearing = calculateBearing(
          start.lat,
          start.lng,
          adjustedLat,
          adjustedLng
        );

        newWaypoints.push({
          id: `waypoint-${i}`,
          lat: adjustedLat,
          lng: adjustedLng,
          distance,
          bearing,
          reached: false,
        });
      }

      setWaypoints(newWaypoints);
    },
    [waypointCount]
  );

  // Request permission for orientation sensors
  const setupOrientation = useCallback(async () => {
    const result = await requestOrientationPermission();
    if (result.success) {
      setOrientationPermission("granted");
      return true;
    } else {
      setOrientationPermission("denied");
      setError(result.error?.message || "Motion sensor access denied");
      return false;
    }
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!enableFullscreen) return;

    if (!isFullscreen) {
      requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
      setIsFullscreen(false);
    }
  }, [enableFullscreen, isFullscreen]);

  // Start calibration process
  const calibrate = useCallback(() => {
    setIsCalibrating(true);

    // In a real implementation, you would do actual sensor calibration here

    // Simulate calibration process
    setTimeout(() => {
      setIsCalibrating(false);

      toast({
        title: "Calibration Complete",
        description: "Your AR navigator has been recalibrated.",
      });

      // Regenerate waypoints after calibration
      if (targetLocation && currentLocation) {
        generateRealWaypoints(currentLocation, targetLocation);
      } else {
        generateMockWaypoints();
      }

      // Reset current waypoint
      setCurrentWaypoint(0);
    }, 3000);
  }, [
    currentLocation,
    targetLocation,
    generateMockWaypoints,
    generateRealWaypoints,
  ]);

  // Start AR navigation
  const startARNavigation = useCallback(async () => {
    // Check camera and orientation permissions
    const cameraReady = await setupCamera();
    const orientationReady = await setupOrientation();

    if (cameraReady && orientationReady) {
      setMode("ar");

      // Go fullscreen if enabled
      if (enableFullscreen) {
        requestFullscreen();
        setIsFullscreen(true);
      }

      return true;
    } else {
      setMode("fallback");

      toast({
        title: "Using Basic Navigation",
        description:
          "AR features are limited. Using basic navigation mode instead.",
        variant: "destructive",
      });

      return false;
    }
  }, [setupCamera, setupOrientation, enableFullscreen]);

  // Start fallback navigation mode
  const startFallbackNavigation = useCallback(() => {
    setMode("fallback");
  }, []);

  // Format distance for display
  const getFormattedDistance = useCallback(() => {
    if (distanceToSafety === null) {
      return "Calculating...";
    }

    // Convert meters to appropriate unit
    if (distanceToSafety < 1000) {
      return `${Math.round(distanceToSafety)} meters`;
    } else {
      const kilometers = distanceToSafety / 1000;
      return `${kilometers.toFixed(1)} km`;
    }
  }, [distanceToSafety]);

  // Get arrow rotation based on compass and target bearing
  const getArrowRotation = useCallback(() => {
    if (targetBearing === null) {
      return 0;
    }

    return (targetBearing - compassHeading + 360) % 360;
  }, [targetBearing, compassHeading]);

  // Return public interface
  return {
    // Refs
    videoRef,
    canvasRef,

    // State
    mode,
    error,
    capabilities,
    cameraPermission,
    orientationPermission,
    locationPermission,
    isCalibrating,
    isFullscreen,
    showDirections,
    showWaypointReached,

    // Navigation data
    compassHeading,
    currentLocation,
    distanceToSafety,
    formattedDistance: getFormattedDistance(),
    evacuationProgress,
    waypoints,
    currentWaypoint,
    arrowRotation: getArrowRotation(),

    // Actions
    startARNavigation,
    startFallbackNavigation,
    toggleDirections: () => setShowDirections((prev) => !prev),
    calibrate,
    toggleFullscreen,
  };
}
