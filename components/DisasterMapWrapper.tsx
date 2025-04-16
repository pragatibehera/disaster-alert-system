// components/LeafletDisasterMapWrapper.tsx
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

// Props interface that matches your MapboxDisasterMap props
interface MapboxDisasterMapWrapperProps {
  height?: string | number;
  width?: string | number;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  pitch?: number;
  bearing?: number;
}

// Wrapper component that passes props to the dynamically loaded map
const MapboxDisasterMapWrapper: React.FC<MapboxDisasterMapWrapperProps> = (
  props
) => {
  return <MapboxDisasterMap {...props} />;
};

export default MapboxDisasterMapWrapper;
