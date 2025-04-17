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
  Camera,
  Compass,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ARSafetyNavigator } from "@/components/ar-safety-navigator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockAlerts } from "@/lib/mock-data";

export default function ARDemoPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState<any | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // On component mount, check if we have any alerts
  useEffect(() => {
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
            <span className="font-bold">DisasterAlert AR Navigator</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-3xl">
          {!selectedDisaster ? (
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
                <div className="rounded-lg overflow-hidden">
                  <ARSafetyNavigator
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

                  {/* AR Navigation Explanation */}
                  <Tabs
                    defaultValue="overview"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="features" className="flex-1">
                        Features
                      </TabsTrigger>
                      <TabsTrigger value="instructions" className="flex-1">
                        Instructions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Navigation className="mr-2 h-5 w-5 text-blue-500" />
                            AR Navigation Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">
                            The AR Navigator uses your device's camera and
                            sensors to provide real-time navigational guidance
                            away from the danger area. It shows directional
                            arrows and waypoints to follow for a safe evacuation
                            route.
                          </p>

                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-slate-100 rounded-lg p-3 text-center flex flex-col items-center">
                              <Camera className="h-8 w-8 text-slate-500 mb-1" />
                              <span className="text-sm font-medium">
                                Camera View
                              </span>
                              <span className="text-xs text-slate-500">
                                Real-world overlay
                              </span>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-3 text-center flex flex-col items-center">
                              <Compass className="h-8 w-8 text-slate-500 mb-1" />
                              <span className="text-sm font-medium">
                                Real-time Compass
                              </span>
                              <span className="text-xs text-slate-500">
                                Direction guidance
                              </span>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-3 text-center flex flex-col items-center">
                              <Target className="h-8 w-8 text-slate-500 mb-1" />
                              <span className="text-sm font-medium">
                                Waypoints
                              </span>
                              <span className="text-xs text-slate-500">
                                Step-by-step routing
                              </span>
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
                    </TabsContent>

                    <TabsContent value="features" className="mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Info className="mr-2 h-5 w-5 text-blue-500" />
                            Key Features
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="bg-red-100 p-1 rounded-full mr-2 mt-0.5">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <span className="font-medium">
                                  Danger Awareness
                                </span>
                                <p className="text-sm text-slate-600">
                                  Visual indicators show distance and direction
                                  from danger zones
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                                <Navigation className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-medium">
                                  Dynamic Routing
                                </span>
                                <p className="text-sm text-slate-600">
                                  Automatically updates evacuation path based on
                                  changing conditions
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                                <Target className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <span className="font-medium">
                                  Waypoint Tracking
                                </span>
                                <p className="text-sm text-slate-600">
                                  Clear visualization of each checkpoint along
                                  your evacuation route
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-purple-100 p-1 rounded-full mr-2 mt-0.5">
                                <Smartphone className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <span className="font-medium">
                                  Offline Capability
                                </span>
                                <p className="text-sm text-slate-600">
                                  Works without internet once loaded, essential
                                  during disasters
                                </p>
                              </div>
                            </li>
                          </ul>

                          <Button
                            onClick={startARNavigation}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Launch AR Navigator
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="instructions" className="mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Info className="mr-2 h-5 w-5 text-blue-500" />
                            How To Use
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-3 list-decimal pl-5">
                            <li className="pl-1">
                              <span className="font-medium">
                                Allow Permissions
                              </span>
                              <p className="text-sm text-slate-600">
                                Grant camera and sensor access when prompted
                              </p>
                            </li>
                            <li className="pl-1">
                              <span className="font-medium">
                                Hold Device Upright
                              </span>
                              <p className="text-sm text-slate-600">
                                Hold your phone upright as if taking a photo
                              </p>
                            </li>
                            <li className="pl-1">
                              <span className="font-medium">
                                Follow the Arrow
                              </span>
                              <p className="text-sm text-slate-600">
                                Walk in the direction the arrow is pointing
                              </p>
                            </li>
                            <li className="pl-1">
                              <span className="font-medium">
                                Reach Waypoints
                              </span>
                              <p className="text-sm text-slate-600">
                                Follow each waypoint until you reach a safe area
                              </p>
                            </li>
                            <li className="pl-1">
                              <span className="font-medium">Stay Alert</span>
                              <p className="text-sm text-slate-600">
                                Continue to monitor your surroundings while
                                using the app
                              </p>
                            </li>
                          </ol>

                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="flex items-center text-amber-800 font-medium">
                              <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                              Important Safety Note
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              This is a simulation. In a real emergency, always
                              prioritize official evacuation orders and
                              instructions from emergency services.
                            </p>
                          </div>

                          <Button
                            onClick={startARNavigation}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Launch AR Navigator
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
