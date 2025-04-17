// Alert interface
export interface Alert {
  id: string;
  type: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  severity: string;
  timestamp: string;
  description: string;
  distance?: number;
}

// User profile interface
export interface UserProfile {
  points: number;
  totalReports: number;
  verifiedReports: number;
  disasterTypes: Set<string>;
  badges: string[];
}

// Safety tip interface
export interface SafetyTip {
  id: string;
  title: string;
  content: string;
  icon?: string;
  disasterType: string;
  priority: number;
}

// AR Navigation mode type
export type ARNavigationMode =
  | "initializing"
  | "instructions"
  | "permissions"
  | "ar"
  | "fallback"
  | "error";

// Waypoint interface
export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  distance: number;
  bearing: number;
  reached: boolean;
}
