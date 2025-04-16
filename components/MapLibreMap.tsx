// components/MapLibreMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Types for our disaster data
type DisasterType = "fire" | "earthquake" | "cyclone";

interface DisasterFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    type: DisasterType;
    intensity: number;
    description: string;
  };
}

interface DisasterFeatureCollection {
  type: "FeatureCollection";
  features: DisasterFeature[];
}

// Mock disaster data
const mockDisasterData: DisasterFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.209, 28.6139], // Delhi
      },
      properties: {
        type: "fire",
        intensity: 0.8,
        description: "Major fire incident in industrial area",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [72.8777, 19.076], // Mumbai
      },
      properties: {
        type: "earthquake",
        intensity: 0.6,
        description: "Moderate earthquake reported",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [88.3639, 22.5726], // Kolkata
      },
      properties: {
        type: "cyclone",
        intensity: 0.9,
        description: "Severe cyclone warning",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [80.2707, 13.0827], // Chennai
      },
      properties: {
        type: "cyclone",
        intensity: 0.7,
        description: "Tropical cyclone approaching coast",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [74.5959, 34.0837], // Srinagar
      },
      properties: {
        type: "earthquake",
        intensity: 0.5,
        description: "Minor seismic activity detected",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [76.9558, 11.0168], // Coimbatore
      },
      properties: {
        type: "fire",
        intensity: 0.4,
        description: "Forest fire in nearby hills",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [83.2185, 17.6868], // Visakhapatnam
      },
      properties: {
        type: "cyclone",
        intensity: 0.8,
        description: "Cyclone warning for coastal areas",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [75.7873, 26.9124], // Jaipur
      },
      properties: {
        type: "fire",
        intensity: 0.3,
        description: "Industrial fire in textile factory",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [78.4867, 17.385], // Hyderabad
      },
      properties: {
        type: "earthquake",
        intensity: 0.4,
        description: "Minor tremors felt in the region",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [85.8245, 20.2961], // Bhubaneswar
      },
      properties: {
        type: "cyclone",
        intensity: 0.6,
        description: "Cyclone alert for Odisha coast",
      },
    },
  ],
};

// Helper functions for creating disaster visualization layers
const createDisasterLayers = (
  map: maplibregl.Map,
  disasterData: DisasterFeatureCollection
) => {
  // Add the source for all disasters
  map.addSource("disasters", {
    type: "geojson",
    data: disasterData,
  });

  // Fire layers
  map.addSource("fire-source", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: disasterData.features.filter(
        (f) => f.properties.type === "fire"
      ),
    },
  });

  // Fire base circle
  map.addLayer({
    id: "fire-base",
    type: "circle",
    source: "fire-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        20,
        1,
        60,
      ],
      "circle-color": "rgba(255, 100, 50, 0.8)",
      "circle-blur": 1,
      "circle-opacity": 0.7,
    },
  });

  // Fire glow effect
  map.addLayer({
    id: "fire-glow",
    type: "circle",
    source: "fire-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        30,
        1,
        100,
      ],
      "circle-color": "rgba(255, 150, 50, 0.4)",
      "circle-blur": 1.5,
      "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.5, 10, 0.2],
    },
  });

  // Create heat spread area for fires (larger radius)
  map.addLayer({
    id: "fire-area",
    type: "circle",
    source: "fire-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        50,
        1,
        200,
      ],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        "rgba(255, 180, 50, 0.1)",
        0.5,
        "rgba(255, 100, 30, 0.15)",
        1,
        "rgba(255, 50, 0, 0.2)",
      ],
      "circle-blur": 0.5,
      "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.2, 10, 0.5],
    },
  });

  // Cyclone layers
  map.addSource("cyclone-source", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: disasterData.features.filter(
        (f) => f.properties.type === "cyclone"
      ),
    },
  });

  // Cyclone base
  map.addLayer({
    id: "cyclone-base",
    type: "circle",
    source: "cyclone-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        30,
        1,
        80,
      ],
      "circle-color": "rgba(100, 160, 220, 0.6)",
      "circle-blur": 0.5,
      "circle-opacity": 0.7,
    },
  });

  // Cyclone outer area
  map.addLayer({
    id: "cyclone-area",
    type: "circle",
    source: "cyclone-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        70,
        1,
        250,
      ],
      "circle-color": "rgba(100, 150, 250, 0.2)",
      "circle-blur": 1,
      "circle-opacity": 0.5,
    },
  });

  // Earthquake layers
  map.addSource("earthquake-source", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: disasterData.features.filter(
        (f) => f.properties.type === "earthquake"
      ),
    },
  });

  // Earthquake epicenter
  map.addLayer({
    id: "earthquake-epicenter",
    type: "circle",
    source: "earthquake-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        6,
        1,
        15,
      ],
      "circle-color": "rgba(255, 220, 50, 0.9)",
      "circle-blur": 0.2,
      "circle-opacity": 0.9,
    },
  });

  // Earthquake wave area (larger radius)
  map.addLayer({
    id: "earthquake-area",
    type: "circle",
    source: "earthquake-source",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0,
        50,
        1,
        200,
      ],
      "circle-color": "rgba(255, 230, 50, 0.2)",
      "circle-stroke-color": "rgba(255, 220, 50, 0.4)",
      "circle-stroke-width": 1,
      "circle-opacity": 0.4,
    },
  });

  // Add small point layer for click interactions
  map.addLayer({
    id: "disaster-points",
    type: "circle",
    source: "disasters",
    paint: {
      "circle-radius": 5,
      "circle-color": [
        "match",
        ["get", "type"],
        "fire",
        "#ff4400",
        "earthquake",
        "#ffdd00",
        "cyclone",
        "#2196f3",
        "#000000",
      ],
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
    },
  });

  // Setup animations for the layers
  let phase = 0;
  const animateDisasters = () => {
    phase += 0.01;

    // Animate fire glow
    map.setPaintProperty("fire-glow", "circle-radius", [
      "+",
      ["interpolate", ["linear"], ["get", "intensity"], 0, 30, 1, 100],
      ["*", ["sin", ["*", phase, 6]], 20],
    ]);

    // Animate cyclone rotation by offsetting the pattern
    map.setPaintProperty("cyclone-base", "circle-blur", [
      "+",
      0.5,
      ["*", ["sin", ["*", phase, 4]], 0.3],
    ]);

    // Animate earthquake waves
    map.setPaintProperty("earthquake-area", "circle-radius", [
      "+",
      ["interpolate", ["linear"], ["get", "intensity"], 0, 50, 1, 200],
      ["*", ["sin", ["*", phase, 2]], 30],
    ]);

    // Continue animation
    requestAnimationFrame(animateDisasters);
  };

  // Start animation
  animateDisasters();

  // Add click interaction for popups
  const popups: { [key: string]: maplibregl.Popup } = {};

  map.on("click", "disaster-points", (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const coordinates = (
      feature.geometry as GeoJSON.Point
    ).coordinates.slice() as [number, number];
    const { type, intensity, description } = feature.properties;

    // Create popup content
    const popupContent = `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 5px; font-size: 16px; color: ${
          type === "fire"
            ? "#ff4400"
            : type === "cyclone"
            ? "#2196f3"
            : "#ffdd00"
        }; text-transform: capitalize;">${type} Alert</h3>
        <p style="margin: 0 0 8px; font-size: 14px;">${description}</p>
        <div style="height: 4px; background: #eee; border-radius: 2px; overflow: hidden; margin-bottom: 5px;">
          <div style="height: 100%; width: ${intensity * 100}%; 
            background: ${
              type === "fire"
                ? "linear-gradient(90deg, #ffdd00, #ff8800, #ff4400)"
                : type === "cyclone"
                ? "linear-gradient(90deg, #00bcd4, #2196f3, #1976d2)"
                : "linear-gradient(90deg, #ffeb3b, #ffc107, #ff9800)"
            };"></div>
        </div>
        <div style="font-size: 12px; text-align: right;">
          Intensity: ${(intensity * 10).toFixed(1)}/10
        </div>
      </div>
    `;

    // Create popup
    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);

    // Store popup reference
    const featureId =
      feature.id?.toString() || `${coordinates[0]}-${coordinates[1]}`;
    popups[featureId] = popup;

    // Remove popup reference when closed
    popup.on("close", () => {
      delete popups[featureId];
    });
  });

  // Change cursor on hover
  map.on("mouseenter", "disaster-points", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "disaster-points", () => {
    map.getCanvas().style.cursor = "";
  });

  // Return a cleanup function
  return () => {
    // Remove all added layers and sources
    [
      "fire-base",
      "fire-glow",
      "fire-area",
      "cyclone-base",
      "cyclone-area",
      "earthquake-epicenter",
      "earthquake-area",
      "disaster-points",
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });

    ["fire-source", "cyclone-source", "earthquake-source", "disasters"].forEach(
      (sourceId) => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      }
    );

    // Close any open popups
    Object.values(popups).forEach((popup) => popup.remove());
  };
};

const MapLibreMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
      pitch: 45,
      bearing: -30,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clean up any existing layers
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Create disaster visualization layers
    const cleanup = createDisasterLayers(map.current, mockDisasterData);
    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [mapLoaded]);

  return (
    <div ref={mapContainer} className="w-full h-[600px] rounded-lg shadow-lg" />
  );
};

export default MapLibreMap;
