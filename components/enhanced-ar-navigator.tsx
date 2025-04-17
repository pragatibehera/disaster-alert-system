"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpCircle,
  MapPin,
  AlertTriangle,
  Compass,
  Map,
  Navigation,
  Target,
  RotateCcw,
  CheckCircle,
  ChevronLeft,
  Camera,
  Info,
  LifeBuoy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useARNavigation } from "@/lib/use-ar-navigation";
import { toast } from "@/components/ui/use-toast";

// Interface for the component props
interface ARSafetyNavigatorProps {
  disaster: {
    type: string;
    location: string;
    severity: string;
    coordinates?: { lat: number; lng: number };
  };
  onClose: () => void;
}

export function EnhancedARSafetyNavigator({
  disaster,
  onClose,
}: ARSafetyNavigatorProps) {
  // State for instructions view
  const [showInstructions, setShowInstructions] = useState(true);

  // Use our AR Navigation hook
  const ar = useARNavigation({
    targetLocation: disaster.coordinates,
    waypointCount: 5,
    enableFullscreen: true,
    onWaypointReached: (index) => {
      toast({
        title: "Waypoint Reached!",
        description: `You've reached waypoint ${
          index + 1
        }. Continue to the next waypoint.`,
      });
    },
    onEvacuationComplete: () => {
      toast({
        title: "Evacuation Complete",
        description: "You have reached a safe area. Great job!",
      });
    },
  });

  // Effect to transition from instructions to AR when user clicks start
  useEffect(() => {
    if (!showInstructions && ar.mode === "initializing") {
      ar.startARNavigation();
    }
  }, [showInstructions, ar.mode, ar.startARNavigation]);

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
            onClick={() => setShowInstructions(false)}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Navigation className="mr-2 h-5 w-5" />
            Start AR Navigation
          </Button>

          <Button
            onClick={() => {
              setShowInstructions(false);
              ar.startFallbackNavigation();
            }}
            variant="outline"
            className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
          >
            Use Basic Navigation Instead
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (ar.mode === "initializing") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-red-500 animate-spin mb-6"></div>
        <h2 className="text-xl font-bold mb-2 text-center">
          Initializing AR Navigator...
        </h2>
        <p className="text-center text-sm text-slate-300 mb-1">
          Please wait while we prepare your navigation
        </p>
      </div>
    );
  }

  // Error state
  if (ar.mode === "error" || ar.error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-black text-white">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-xl font-bold mb-2 text-center text-red-500">
          {ar.error}
        </h2>
        <p className="text-center mb-6 max-w-md text-slate-300">
          AR navigation encountered an error. You can try again or use basic
          navigation mode.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => ar.startARNavigation()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => ar.startFallbackNavigation()}
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
  if (ar.mode === "fallback") {
    return (
      <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Static Directional Guidance */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white mb-4 text-lg font-medium">
            Basic Navigation Mode
          </p>

          {/* Direction Arrow */}
          <motion.div
            animate={{ rotate: ar.arrowRotation }}
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
              <span className="text-sm">{Math.round(ar.compassHeading)}°</span>
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
              <span className="font-medium">{ar.formattedDistance}</span> from
              hazard
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 mb-1">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Evacuation Progress</span>
              <span>{Math.round(ar.evacuationProgress)}%</span>
            </div>
            <Progress value={ar.evacuationProgress} className="h-2" />
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
        <div className="absolute right-4 top-14 z-10 flex flex-col gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={ar.calibrate}
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
        ref={ar.videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ display: ar.mode === "ar" ? "block" : "none" }}
      />

      {/* Canvas overlay for AR elements */}
      <canvas
        ref={ar.canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Calibration Overlay */}
      {ar.isCalibrating && (
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
            animate={{ rotate: ar.arrowRotation }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative z-10"
          >
            <ArrowUpCircle className="h-32 w-32 text-red-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </motion.div>

          {/* Waypoint reached notification */}
          <AnimatePresence>
            {ar.showWaypointReached && (
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
        {ar.showDirections && ar.waypoints.length > 0 && (
          <div className="absolute left-0 right-0 top-1/2 flex justify-center items-center">
            <div className="relative h-1 bg-white/20 w-3/4 rounded-full overflow-hidden">
              {ar.waypoints.map((waypoint, index) => (
                <div
                  key={waypoint.id}
                  className={`absolute w-6 h-6 -mt-2.5 rounded-full flex items-center justify-center transition-colors
                    ${
                      index === ar.currentWaypoint
                        ? "bg-blue-500 border-2 border-white"
                        : waypoint.reached
                        ? "bg-green-500"
                        : "bg-white/50"
                    }`}
                  style={{
                    left: `${(index / (ar.waypoints.length - 1)) * 100}%`,
                  }}
                >
                  {index === ar.currentWaypoint && (
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
              <span className="text-sm">{Math.round(ar.compassHeading)}°</span>
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
              <span className="font-medium">{ar.formattedDistance}</span> from
              hazard
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-white/70">Evacuation Progress</span>
              <span className="text-xs font-medium">
                {Math.round(ar.evacuationProgress)}%
              </span>
            </div>
            <Progress value={ar.evacuationProgress} className="h-2" />
          </div>

          {ar.waypoints.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">Current Waypoint: </span>
                <span>
                  {ar.currentWaypoint + 1} of {ar.waypoints.length}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Next: </span>
                <span>
                  {ar.waypoints[ar.currentWaypoint]?.distance.toFixed(0)}m
                </span>
              </div>
            </div>
          )}
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
          onClick={ar.toggleDirections}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <Navigation className="mr-2 h-4 w-4" />
          {ar.showDirections ? "Hide Route" : "Show Route"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={ar.calibrate}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Recalibrate
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={ar.toggleFullscreen}
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <Info className="mr-2 h-4 w-4" />
          {ar.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>

        {/* Safety Tips Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(`/tips/${disaster.type.toLowerCase()}`, "_blank")
          }
          className="bg-black/50 text-white hover:bg-black/70 border-white/30"
        >
          <LifeBuoy className="mr-2 h-4 w-4" />
          Safety Tips
        </Button>
      </div>
    </div>
  );
}
