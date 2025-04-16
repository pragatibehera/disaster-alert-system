"use client";

import { AlertTriangle, Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Alert {
  id: string;
  type: string;
  location: string;
  coordinates: { lat: number; lng: number };
  severity: string;
  timestamp: string;
  description: string;
  distance: number;
}

export function AlertCard({
  alert,
  onClick,
}: {
  alert: Alert;
  onClick: () => void;
}) {
  const severityColor =
    alert.severity === "high"
      ? "bg-red-100 text-red-800 border-red-200"
      : alert.severity === "medium"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-green-100 text-green-800 border-green-200";

  const severityText =
    alert.severity === "high"
      ? "High"
      : alert.severity === "medium"
      ? "Medium"
      : "Low";

  // Format the timestamp consistently for server and client
  const formattedTime = (() => {
    const date = new Date(alert.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  })();

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="cursor-pointer overflow-hidden border-l-4 transition-all hover:shadow-md"
        style={{
          borderLeftColor:
            alert.severity === "high"
              ? "#ef4444"
              : alert.severity === "medium"
              ? "#f59e0b"
              : "#22c55e",
        }}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <AlertTriangle
                className={`mr-2 h-5 w-5 ${
                  alert.severity === "high"
                    ? "text-red-600"
                    : alert.severity === "medium"
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              />
              <h3 className="font-medium">{alert.type}</h3>
            </div>
            <Badge variant="outline" className={severityColor}>
              {severityText}
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              <span>
                {alert.location} ({alert.distance} miles away)
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <p className="mt-2 text-sm line-clamp-2">{alert.description}</p>

          <div className="mt-3 flex items-center justify-end text-xs font-medium text-red-600">
            <span>View details</span>
            <ChevronRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
