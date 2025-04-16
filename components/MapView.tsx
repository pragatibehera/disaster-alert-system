"use client";

import dynamic from "next/dynamic";

const MapLibreMap = dynamic(() => import("./MapLibreMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-lg shadow-lg bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function MapView() {
  return <MapLibreMap />;
}
