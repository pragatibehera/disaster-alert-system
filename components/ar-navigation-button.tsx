"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "lucide-react";
import { ARNavigationButton as ARButton } from "@/lib/ar-integration";
import { Alert } from "@/lib/types";

interface ARNavigationButtonProps {
  alert?: Alert;
  className?: string;
}

export function ARNavigationButton({
  alert,
  className = "",
}: ARNavigationButtonProps) {
  if (!alert) {
    return (
      <Card
        className={`overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 ${className}`}
      >
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3">
              <Navigation className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Emergency Navigation</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Launch AR navigation to safety from nearby disasters
            </p>
            <Button className="w-full bg-red-600 hover:bg-red-700" disabled>
              <Navigation className="mr-2 h-4 w-4" />
              Select a disaster first
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 ${className}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <Navigation className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Emergency Navigation</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Use AR to navigate to safety from {alert.type.toLowerCase()}
          </p>
          <ARButton
            alert={alert}
            className="w-full bg-red-600 hover:bg-red-700"
          />
        </div>
      </CardContent>
    </Card>
  );
}
