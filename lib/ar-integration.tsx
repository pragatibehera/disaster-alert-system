"use client";

import { useState, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EnhancedARSafetyNavigator } from "@/components/enhanced-ar-navigator";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { checkARCapabilities } from "@/lib/ar-capabilities";

// Alert interface that matches your app's data structure
interface Alert {
  id: string;
  type: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  severity: string;
  timestamp: string;
  description: string;
  distance?: number;
}

/**
 * AR Navigator Provider - Use this component to easily add AR navigation to your app
 */
export function ARNavigatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showARNavigator, setShowARNavigator] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Check if device supports AR features
  const [arCapabilities] = useState(() =>
    typeof window !== "undefined" ? checkARCapabilities() : null
  );

  const openARNavigator = useCallback(
    (alert: Alert) => {
      setSelectedAlert(alert);
      setShowARNavigator(true);

      // If device doesn't support AR, show a toast notification
      if (arCapabilities && !arCapabilities.compatible) {
        toast({
          title: "Limited AR Support",
          description:
            arCapabilities.incompatibleReason ||
            "Your device has limited support for AR features.",
          variant: "destructive",
        });
      }
    },
    [arCapabilities]
  );

  const closeARNavigator = useCallback(() => {
    setShowARNavigator(false);
  }, []);

  return (
    <>
      {children}

      {/* AR Navigator Sheet */}
      {showARNavigator && selectedAlert && (
        <Sheet open={showARNavigator} onOpenChange={setShowARNavigator}>
          <SheetContent className="w-full sm:max-w-md p-0">
            <EnhancedARSafetyNavigator
              disaster={{
                type: selectedAlert.type,
                location: selectedAlert.location,
                severity: selectedAlert.severity,
                coordinates: selectedAlert.coordinates,
              }}
              onClose={closeARNavigator}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

/**
 * AR Navigation Button - Easily add AR navigation button to your UI
 */
export function ARNavigationButton({
  alert,
  className = "",
  variant = "default",
  size = "default",
  label = "AR Navigation",
}: {
  alert: Alert;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}) {
  const [arCapabilities] = useState(() =>
    typeof window !== "undefined" ? checkARCapabilities() : null
  );
  const [showARNavigator, setShowARNavigator] = useState(false);

  const handleClick = useCallback(() => {
    // If device doesn't support AR, show a toast notification
    if (arCapabilities && !arCapabilities.compatible) {
      toast({
        title: "Limited AR Support",
        description:
          arCapabilities.incompatibleReason ||
          "Your device has limited support for AR features.",
        variant: "destructive",
      });
    }

    setShowARNavigator(true);
  }, [arCapabilities]);

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
        variant={variant}
        size={size}
      >
        <Navigation className="mr-2 h-4 w-4" />
        {label}
      </Button>

      {/* AR Navigator Sheet */}
      {showARNavigator && (
        <Sheet open={showARNavigator} onOpenChange={setShowARNavigator}>
          <SheetContent className="w-full sm:max-w-md p-0">
            <EnhancedARSafetyNavigator
              disaster={{
                type: alert.type,
                location: alert.location,
                severity: alert.severity,
                coordinates: alert.coordinates,
              }}
              onClose={() => setShowARNavigator(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

/**
 * Hook to use AR navigation anywhere in your app
 */
export function useARNavigator() {
  const [showARNavigator, setShowARNavigator] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const openARNavigator = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setShowARNavigator(true);

    // Check capabilities on demand
    const arCapabilities =
      typeof window !== "undefined" ? checkARCapabilities() : null;

    // If device doesn't support AR, show a toast notification
    if (arCapabilities && !arCapabilities.compatible) {
      toast({
        title: "Limited AR Support",
        description:
          arCapabilities.incompatibleReason ||
          "Your device has limited support for AR features.",
        variant: "destructive",
      });
    }
  }, []);

  const closeARNavigator = useCallback(() => {
    setShowARNavigator(false);
  }, []);

  // Component to render the AR navigator
  const ARNavigatorComponent = useCallback(() => {
    if (!showARNavigator || !selectedAlert) return null;

    return (
      <Sheet open={showARNavigator} onOpenChange={setShowARNavigator}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <EnhancedARSafetyNavigator
            disaster={{
              type: selectedAlert.type,
              location: selectedAlert.location,
              severity: selectedAlert.severity,
              coordinates: selectedAlert.coordinates,
            }}
            onClose={closeARNavigator}
          />
        </SheetContent>
      </Sheet>
    );
  }, [showARNavigator, selectedAlert, closeARNavigator]);

  return {
    openARNavigator,
    closeARNavigator,
    ARNavigatorComponent,
    isOpen: showARNavigator,
  };
}

/**
 * Example usage in a component:
 *
 * function AlertDetail({ alert }) {
 *   const { openARNavigator, ARNavigatorComponent } = useARNavigator();
 *
 *   return (
 *     <div>
 *       <h2>{alert.type} Alert</h2>
 *       <Button onClick={() => openARNavigator(alert)}>
 *         <Navigation className="mr-2 h-4 w-4" />
 *         Navigate to Safety
 *       </Button>
 *       <ARNavigatorComponent />
 *     </div>
 *   );
 * }
 */
