"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ChevronLeft,
  MapPin,
  AlertTriangle,
  Navigation,
  Info,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAlerts } from "@/lib/mock-data";
import { MobileARNavigator } from "@/components/mobile-ar-navigator";

export default function MobileARPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState<any | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [deviceCompatible, setDeviceCompatible] = useState<boolean | null>(
    null
  );

  // On component mount, check device compatibility
  useEffect(() => {
    checkDeviceCompatibility();

    // Get the highest priority mock alert
    if (mockAlerts.length > 0) {
      // Sort alerts by severity and distance
      const sortedAlerts = [...mockAlerts].sort((a, b) => {
        // First prioritize by severity
        const severityScore = { high: 3, medium: 2, low: 1 };
        const severityDiff =
          severityScore[b.severity as keyof typeof severityScore] -
          severityScore[a.severity as keyof typeof severityScore];

        if (severityDiff !== 0) return severityDiff;

        // Then by distance if severity is the same
        return a.distance - b.distance;
      });

      // Select the highest priority alert
      setSelectedDisaster(sortedAlerts[0]);
    }
  }, []);

  // Check device compatibility for AR
  const checkDeviceCompatibility = () => {
    // Always enable for mobile devices - many Android devices report incorrect capabilities
    // but have working camera and sensors
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // If we detect a mobile device, assume it's compatible
    // This is more permissive and gives users a chance to try the feature
    if (isMobile) {
      setDeviceCompatible(true);
      return;
    }

    // Fall back to specific capability checks for non-mobile or undetected devices
    const hasCamera =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia;

    const hasOrientation =
      typeof window !== "undefined" && "DeviceOrientationEvent" in window;

    setDeviceCompatible(hasCamera && hasOrientation && isMobile);
  };

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  const startARNavigation = () => {
    setShowNavigator(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="mr-4 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold">Mobile AR Navigator</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-3xl">
          {!deviceCompatible && deviceCompatible !== null ? (
            // Device not compatible
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Device Compatibility Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your device may not support all features needed for AR
                  navigation. AR navigation works best on mobile devices with
                  camera and orientation sensors.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleBackClick}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    onClick={() => setDeviceCompatible(true)}
                    variant="outline"
                  >
                    Try Anyway
                  </Button>
                  <Button
                    onClick={() => {
                      setDeviceCompatible(true);
                      setShowNavigator(true);
                      // Adding a query parameter to trigger simulation mode
                      sessionStorage.setItem("useSimulationMode", "true");
                    }}
                    variant="outline"
                  >
                    Try Simulation Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !selectedDisaster ? (
            // No disasters available
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  No Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There are no active alerts in your area at this time. Return
                  to the dashboard for more information.
                </p>
                <Button
                  onClick={handleBackClick}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Show AR Navigator or Disaster info
            <div>
              {showNavigator ? (
                // AR Navigator component
                <div className="rounded-lg overflow-hidden bg-black">
                  <MobileARNavigator
                    disaster={{
                      type: selectedDisaster.type,
                      location: selectedDisaster.location,
                      severity: selectedDisaster.severity,
                    }}
                    onClose={() => setShowNavigator(false)}
                  />
                </div>
              ) : (
                // Disaster overview and AR explanation
                <div className="space-y-4">
                  {/* Alert Card */}
                  <Card
                    className="border-l-4 overflow-hidden transition-all"
                    style={{
                      borderLeftColor:
                        selectedDisaster.severity === "high"
                          ? "#ef4444"
                          : selectedDisaster.severity === "medium"
                          ? "#f59e0b"
                          : "#22c55e",
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <AlertTriangle
                            className={`mr-2 h-5 w-5 ${
                              selectedDisaster.severity === "high"
                                ? "text-red-600"
                                : selectedDisaster.severity === "medium"
                                ? "text-amber-600"
                                : "text-green-600"
                            }`}
                          />
                          {selectedDisaster.type} Alert
                        </span>
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-1 h-4 w-4 text-slate-400" />
                          <span>{selectedDisaster.location}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>{selectedDisaster.description}</p>
                      <p className="mt-2">
                        <strong>Distance:</strong> {selectedDisaster.distance}{" "}
                        miles away |<strong> Severity:</strong>{" "}
                        {selectedDisaster.severity.charAt(0).toUpperCase() +
                          selectedDisaster.severity.slice(1)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* AR Navigation Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Navigation className="mr-2 h-5 w-5 text-blue-500" />
                        Mobile AR Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        Our AR Navigator uses your device's camera and sensors
                        to provide real-time navigational guidance away from the
                        danger area. It shows directional arrows and waypoints
                        to follow for a safe evacuation route.
                      </p>

                      <div className="bg-slate-100 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <Smartphone className="h-8 w-8 text-slate-500 mr-3 mt-1" />
                          <div>
                            <h3 className="font-medium mb-1">
                              Browser-based AR Navigation
                            </h3>
                            <p className="text-sm text-slate-600">
                              This feature uses your device's camera and motion
                              sensors. You'll be prompted to grant permission
                              when you start. For the best experience, hold your
                              phone upright and follow the on-screen guidance.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={startARNavigation}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Launch AR Navigator
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
