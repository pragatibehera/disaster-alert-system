// app/disaster-map/page.tsx
"use client";

import MapboxDisasterMapWrapper from "@/components/DisasterMapWrapper";
import React from "react";

export default function DisasterMapPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time Disaster Map</h1>
      <p className="mb-4">
        This interactive 3D map displays real-time disaster events across India,
        including fires, cyclones, earthquakes, and floods. Hover over the
        events to see detailed information.
      </p>

      <div className="rounded-lg overflow-hidden shadow-lg">
        <MapboxDisasterMapWrapper
          height="600px"
          width="100%"
          center={[78.9629, 20.5937]} // Center of India
          zoom={4}
          pitch={45}
          bearing={-10}
        />
      </div>
    </div>
  );
}
