// components/MapboxDisasterMap.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types for our disaster data
type DisasterType = "fire" | "cyclone" | "earthquake" | "flood";

interface DisasterEvent {
  id: string;
  type: DisasterType | string;
  position?: [number, number]; // [longitude, latitude]
  coordinates?: { lat: number; lng: number }; // Alternative format
  intensity?: number; // 0-1 scale
  name?: string;
  location?: string;
  description: string;
  timestamp: string;
  severity?: string;
  distance?: number;
}

interface MapboxDisasterMapProps {
  height?: string | number;
  width?: string | number;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  pitch?: number; // Added but not used in Leaflet (for compatibility)
  bearing?: number; // Added but not used in Leaflet (for compatibility)
  alerts?: DisasterEvent[]; // Added to support external alerts
}

// Mock disaster data (used as fallback if no alerts provided)
const DISASTER_EVENTS: DisasterEvent[] = [
  // Fires
  {
    id: "fire-1",
    type: "fire",
    position: [77.209, 28.6139], // Delhi [lon, lat]
    intensity: 0.8,
    name: "Delhi Industrial Fire",
    description: "Major fire incident in industrial area",
    timestamp: new Date().toISOString(),
  },
  {
    id: "fire-2",
    type: "fire",
    position: [76.9558, 11.0168], // Coimbatore
    intensity: 0.4,
    name: "Coimbatore Forest Fire",
    description: "Forest fire in nearby hills",
    timestamp: new Date().toISOString(),
  },
  // Cyclones
  {
    id: "cyclone-1",
    type: "cyclone",
    position: [88.3639, 22.5726], // Kolkata
    intensity: 0.9,
    name: "Kolkata Cyclone",
    description: "Severe cyclone warning",
    timestamp: new Date().toISOString(),
  },
  {
    id: "cyclone-2",
    type: "cyclone",
    position: [80.2707, 13.0827], // Chennai
    intensity: 0.7,
    name: "Chennai Tropical Cyclone",
    description: "Tropical cyclone approaching coast",
    timestamp: new Date().toISOString(),
  },
  // Earthquakes
  {
    id: "earthquake-1",
    type: "earthquake",
    position: [72.8777, 19.076], // Mumbai
    intensity: 0.6,
    name: "Mumbai Earthquake",
    description: "Moderate earthquake reported",
    timestamp: new Date().toISOString(),
  },
  // Floods
  {
    id: "flood-1",
    type: "flood",
    position: [93.9368, 24.817], // Manipur
    intensity: 0.7,
    name: "Manipur Flooding",
    description: "Severe flooding in low-lying areas",
    timestamp: new Date().toISOString(),
  },
];

const MapboxDisasterMap: React.FC<MapboxDisasterMapProps> = ({
  height = "600px",
  width = "100%",
  center = [78.9629, 20.5937], // Center of India [lon, lat]
  zoom = 5,
  // We ignore pitch and bearing since Leaflet doesn't support them
  pitch = 0,
  bearing = 0,
  alerts = [],
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const animationFramesRef = useRef<{ [key: string]: number }>({});
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Combine provided alerts with mock data if needed
  const displayAlerts = alerts.length > 0 ? alerts : DISASTER_EVENTS;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Create map instance - note that Leaflet uses [lat, lng] order while we use [lng, lat] in our props
    const map = L.map(mapContainer.current).setView(
      [center[1], center[0]],
      zoom
    );

    // Add tile layer - OpenStreetMap (no API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add scale control
    L.control.scale().addTo(map);

    // Store map instance
    mapRef.current = map;
    setIsMapInitialized(true);

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        // Cancel any animations
        Object.values(animationFramesRef.current).forEach((id) => {
          cancelAnimationFrame(id);
        });

        // Clean up markers
        markersRef.current.forEach((marker) => {
          marker.remove();
        });

        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  // Add custom CSS for animations
  useEffect(() => {
    if (!isMapInitialized) return;

    // Create and append styles for disaster markers
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .disaster-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-sizing: border-box;
        position: relative;
      }
      
      .fire-marker {
        background-color: rgba(255, 69, 0, 0.5);
        box-shadow: 0 0 10px rgba(255, 69, 0, 0.8);
        animation: fire-flicker 2s infinite alternate;
      }
      
      .cyclone-marker {
        background-color: rgba(30, 144, 255, 0.2);
        border: 2px solid rgba(30, 144, 255, 0.8);
        animation: cyclone-spin 4s linear infinite;
      }
      
      .earthquake-marker {
        background-color: rgba(255, 215, 0, 0.5);
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        animation: earthquake-pulse 2s infinite;
      }
      
      .flood-marker {
        background-color: rgba(0, 119, 190, 0.5);
        box-shadow: 0 0 10px rgba(0, 119, 190, 0.8);
        animation: flood-wave 3s infinite;
      }
      
      @keyframes fire-flicker {
        0% { transform: scale(0.9); opacity: 0.7; }
        100% { transform: scale(1.1); opacity: 1; }
      }
      
      @keyframes cyclone-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes earthquake-pulse {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.2); }
        100% { transform: scale(0.8); }
      }
      
      @keyframes flood-wave {
        0% { transform: scale(0.9); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 0.9; }
        100% { transform: scale(0.9); opacity: 0.7; }
      }
      
      .marker-icon {
        font-size: 18px;
        z-index: 10;
      }
      
      /* Custom popup styles */
      .leaflet-popup-content-wrapper {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 6px;
      }
      
      .leaflet-popup-tip {
        background-color: rgba(0, 0, 0, 0.8);
      }
      
      .disaster-popup-title {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 16px;
      }
      
      .disaster-popup-description {
        margin-bottom: 8px;
        font-size: 13px;
      }
      
      .disaster-popup-meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        border-top: 1px solid rgba(255,255,255,0.2);
        padding-top: 5px;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isMapInitialized]);

  // Add disaster markers
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    // Add markers for each disaster
    displayAlerts.forEach((disaster) => {
      // Create custom marker icon
      const intensity =
        disaster.intensity || disaster.severity === "high"
          ? 0.8
          : disaster.severity === "medium"
          ? 0.5
          : 0.3;
      const markerSize = 30 + Math.round(intensity * 30);

      // Get alert name and location
      const alertName =
        disaster.name || `${disaster.type} in ${disaster.location}`;
      const alertDescription = disaster.description || "Alert information";

      // Create icon for the marker type
      let icon;
      const disasterType = disaster.type.toLowerCase();
      switch (disasterType) {
        case "fire":
        case "wildfire":
          icon = "🔥";
          break;
        case "cyclone":
        case "hurricane":
        case "tornado":
          icon = "🌀";
          break;
        case "earthquake":
          icon = "⚠️";
          break;
        case "flood":
          icon = "💧";
          break;
        default:
          icon = "⚠️";
      }

      // Create marker HTML element
      const markerHtml = `
        <div class="disaster-marker ${disasterType}-marker" style="width: ${markerSize}px; height: ${markerSize}px;">
          <span class="marker-icon">${icon}</span>
        </div>
      `;

      // Create custom divIcon
      const customIcon = L.divIcon({
        html: markerHtml,
        className: "", // We need an empty class to avoid default styles
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      // Determine the coordinates
      let lat, lng;
      if (disaster.position) {
        // Using [longitude, latitude] format
        lng = disaster.position[0];
        lat = disaster.position[1];
      } else if (disaster.coordinates) {
        // Using {lat, lng} format
        lat = disaster.coordinates.lat;
        lng = disaster.coordinates.lng;
      } else {
        // Skip if no position data
        console.warn("Disaster without position data:", disaster);
        return;
      }

      // Create popup content
      const popupContent = `
        <div class="disaster-popup">
          <div class="disaster-popup-title">${alertName}</div>
          <div class="disaster-popup-description">${alertDescription}</div>
          <div class="disaster-popup-meta">
            <span>${
              disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)
            }</span>
            <span>${
              disaster.severity
                ? "Severity: " + disaster.severity
                : disaster.intensity
                ? "Intensity: " + Math.round(disaster.intensity * 10) + "/10"
                : ""
            }</span>
          </div>
        </div>
      `;

      // Create marker with [lat, lng] order for Leaflet
      const marker = L.marker([lat, lng], {
        icon: customIcon,
        title: alertName,
      });

      // Add to map if it exists
      if (mapRef.current) {
        marker.addTo(mapRef.current);
      }

      // Add popup
      marker.bindPopup(popupContent);

      // Store marker reference for cleanup
      markersRef.current.push(marker);
    });
  }, [isMapInitialized, displayAlerts]);

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Loading indicator */}
      {!isMapInitialized && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 999,
          }}
        >
          Loading map...
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 999,
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Disaster Types
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 69, 0, 0.8)",
              marginRight: "5px",
            }}
          ></div>
          <span>Fire</span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(30, 144, 255, 0.8)",
              marginRight: "5px",
            }}
          ></div>
          <span>Cyclone</span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 215, 0, 0.8)",
              marginRight: "5px",
            }}
          ></div>
          <span>Earthquake</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 119, 190, 0.8)",
              marginRight: "5px",
            }}
          ></div>
          <span>Flood</span>
        </div>
      </div>
    </div>
  );
};

export default MapboxDisasterMap;
