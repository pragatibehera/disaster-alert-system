"use client";

import React from "react";
import Link from "next/link";
import { MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DisasterMapProps {
  height?: string | number;
  width?: string | number;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  pitch?: number;
  bearing?: number;
  alerts?: Array<{
    id: string;
    type: string;
    location: string;
    coordinates: { lat: number; lng: number };
    severity: string;
    timestamp: string;
    description: string;
    distance: number;
  }>;
}

export function DisasterMap({
  height = "600px",
  width = "100%",
  center = [78.9629, 20.5937], // Center of India
  zoom = 4,
  pitch = 45,
  bearing = -10,
  alerts = [],
}: DisasterMapProps) {
  return (
    <div
      className="disaster-map-container rounded-lg overflow-hidden shadow-lg bg-slate-100 flex flex-col items-center justify-center text-center p-8"
      style={{ height, width }}
    >
      <MapIcon className="h-16 w-16 text-slate-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">View Disaster Map</h3>
      <p className="text-slate-500 max-w-md mb-6">
        Click below to view an interactive 3D map displaying real-time disaster
        events across India, including fires, cyclones, earthquakes, and floods.
      </p>
      <Button asChild className="bg-red-600 hover:bg-red-700">
        <Link href="/map">Open Full Map</Link>
      </Button>
    </div>
  );
}
