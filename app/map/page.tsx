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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-red-600">
            Fire Events
          </h2>
          <p>
            Fire events are displayed with red/orange pulsating markers. The
            animation represents the intensity and flickering nature of fires.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Cyclones</h2>
          <p>
            Cyclones are visualized with blue rotating circular patterns. The
            spinning animation mimics the rotational nature of cyclonic storms.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-yellow-600">
            Earthquakes
          </h2>
          <p>
            Earthquakes are shown with yellow pulsing circles. The pulsating
            animation represents seismic waves radiating from the epicenter.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Floods</h2>
          <p>
            Floods are represented with blue rippling markers. The wave-like
            animation simulates the movement of floodwaters.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">How to Use This Map</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pan by clicking and dragging the map</li>
          <li>
            Zoom in/out using the scroll wheel or the controls in the top-right
          </li>
          <li>Rotate and tilt the map by holding right-click and dragging</li>
          <li>Hover over disaster markers to see detailed information</li>
        </ul>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow text-center">
        <p className="text-gray-600">
          Developed for disaster management hackathon. No API key required.
          <br />
          <span className="text-sm">
            Using OpenStreetMap data which is available under the Open Database
            License.
          </span>
        </p>
      </div>
    </div>
  );
}
