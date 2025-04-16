"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronLeft, MapPin, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ARSafetyNavigator } from "@/components/ar-safety-navigator";
import { mockAlerts } from "@/lib/mock-data";

export default function ARNavigatorPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState<any | null>(null);

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
            <span className="font-bold">DisasterAlert AR Navigation</span>
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
            // AR Navigator with selected disaster
            <div>
              <Card className="mb-4">
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
                    <strong>Distance:</strong> {selectedDisaster.distance} miles
                    away |<strong> Severity:</strong>{" "}
                    {selectedDisaster.severity.charAt(0).toUpperCase() +
                      selectedDisaster.severity.slice(1)}
                  </p>
                </CardContent>
              </Card>

              <div className="rounded-lg overflow-hidden">
                <ARSafetyNavigator
                  disaster={{
                    type: selectedDisaster.type,
                    location: selectedDisaster.location,
                    severity: selectedDisaster.severity,
                  }}
                  onClose={handleBackClick}
                />
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>
                  Move your device to see directional guidance. The arrow will
                  point you away from the danger area.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
