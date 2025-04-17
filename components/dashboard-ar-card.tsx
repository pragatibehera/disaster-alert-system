"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/lib/types";
import { ARNavigationButton } from "@/lib/ar-integration";
import { Compass, MapPin, Navigation } from "lucide-react";

interface DashboardARCardProps {
  alerts: Alert[];
  selectedAlert: Alert | null;
  onSelectAlert: (alert: Alert) => void;
  className?: string;
}

export function DashboardARCard({
  alerts,
  selectedAlert,
  onSelectAlert,
  className = "",
}: DashboardARCardProps) {
  // Find nearest alert if none is selected
  const nearestAlert =
    selectedAlert ||
    (alerts.length > 0
      ? alerts.sort((a, b) => (a.distance || 999) - (b.distance || 999))[0]
      : null);

  return (
    <Card
      className={`overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-orange-200 ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Navigation className="mr-2 h-5 w-5 text-red-600" />
          AR Emergency Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nearestAlert ? (
          <div className="space-y-4">
            <div className="rounded-md bg-white/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-700">
                  {nearestAlert.type}
                </span>
                <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  {nearestAlert.severity}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-600 mb-1">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                <span>{nearestAlert.location}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Compass className="mr-1 h-3.5 w-3.5" />
                <span>
                  {nearestAlert.distance
                    ? `${nearestAlert.distance.toFixed(1)} miles away`
                    : "Distance unknown"}
                </span>
              </div>
            </div>

            <ARNavigationButton
              alert={nearestAlert}
              className="bg-red-600 hover:bg-red-700 w-full"
              size="lg"
              label="Navigate to Safety"
            />

            {selectedAlert?.id !== nearestAlert.id && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Note: Using the nearest disaster. You can select a different one
                from the alerts list.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-3">No active disasters nearby</p>
            <Button variant="outline" className="border-orange-200" disabled>
              No routes available
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
