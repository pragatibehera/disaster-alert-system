"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the MapboxDisasterMap component with no SSR
const MapboxDisasterMap = dynamic(() => import("./MapboxDisasterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
      <div className="text-gray-500">Loading disaster map...</div>
    </div>
  ),
});

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
    <div className="disaster-map-container rounded-lg overflow-hidden shadow-lg">
      <MapboxDisasterMap
        height={height}
        width={width}
        center={center}
        zoom={zoom}
        pitch={pitch}
        bearing={bearing}
        alerts={alerts}
      />
    </div>
  );
}
