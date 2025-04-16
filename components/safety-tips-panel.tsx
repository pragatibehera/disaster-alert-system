"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Send,
  CheckCircle,
  ChevronRight,
  Navigation,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ARSafetyNavigator } from "./ar-safety-navigator";

interface Alert {
  id: string;
  type: string;
  location: string;
  severity: string;
  timestamp: string;
  description: string;
}

export function SafetyTipsPanel({
  alert,
  onClose,
}: {
  alert: Alert;
  onClose: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showARNavigator, setShowARNavigator] = useState(false);

  const handleSendSMS = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to receive SMS alerts.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    // Simulate sending SMS
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast({
        title: "Safety Tips Sent",
        description: `Safety instructions have been sent to ${phoneNumber}.`,
      });
    }, 1500);
  };

  // Generate safety tips based on disaster type
  const getSafetyTips = () => {
    switch (alert.type.toLowerCase()) {
      case "flood":
        return [
          "Move to higher ground immediately",
          "Do not walk, swim, or drive through flood waters",
          "Stay off bridges over fast-moving water",
          "Evacuate if told to do so",
          "Disconnect utilities if instructed by authorities",
        ];
      case "earthquake":
        return [
          "Drop, Cover, and Hold On",
          "If indoors, stay away from windows and exterior walls",
          "If outdoors, move to a clear area away from buildings",
          "After shaking stops, check yourself and others for injuries",
          "Be prepared for aftershocks",
        ];
      case "wildfire":
        return [
          "Follow evacuation orders immediately",
          "Close all windows and doors",
          "Remove flammable items from around your home",
          "Fill containers with water for firefighting",
          "Wear protective clothing and mask if smoke is present",
        ];
      case "hurricane":
        return [
          "Follow evacuation orders from local officials",
          "Secure your home - board up windows and secure outdoor objects",
          "Have emergency supplies ready",
          "Stay indoors during the hurricane",
          "Avoid floodwaters and downed power lines",
        ];
      case "tornado":
        return [
          "Seek shelter in a basement or interior room on the lowest floor",
          "Stay away from windows, doors, and outside walls",
          "Cover your head and neck with your arms",
          "If outside, seek shelter in a sturdy building immediately",
          "Do not try to outrun a tornado in a vehicle",
        ];
      default:
        return [
          "Stay informed through local news and weather alerts",
          "Follow instructions from emergency officials",
          "Have an emergency kit ready",
          "Charge your phone and other essential devices",
          "Check on vulnerable neighbors if safe to do so",
        ];
    }
  };

  // Get nearby shelters (mock data)
  const nearbyShelters = [
    {
      name: "Community Center",
      address: "123 Main St",
      distance: "0.8 miles",
    },
    {
      name: "High School Gymnasium",
      address: "456 Oak Ave",
      distance: "1.2 miles",
    },
    {
      name: "Public Library",
      address: "789 Pine Rd",
      distance: "2.5 miles",
    },
  ];

  const severityColor =
    alert.severity === "high"
      ? "bg-red-100 text-red-800 border-red-200"
      : alert.severity === "medium"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-green-100 text-green-800 border-green-200";

  // If AR Navigator is active, show it instead of the tips panel
  if (showARNavigator) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <ARSafetyNavigator
            disaster={{
              type: alert.type,
              location: alert.location,
              severity: alert.severity,
            }}
            onClose={() => setShowARNavigator(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle
                className={`mr-2 h-5 w-5 ${
                  alert.severity === "high"
                    ? "text-red-600"
                    : alert.severity === "medium"
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              />
              {alert.type} Safety Instructions
            </span>
            <Badge variant="outline" className={severityColor}>
              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}{" "}
              Severity
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-md bg-slate-50 p-3"
          >
            <p className="text-sm font-medium">Location: {alert.location}</p>
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              {new Date(alert.timestamp).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              })}
            </p>
          </motion.div>

          {/* AR Navigation Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              onClick={() => setShowARNavigator(true)}
              className="w-full bg-red-600 hover:bg-red-700 h-auto py-3"
            >
              <div className="flex flex-col items-center">
                <Navigation className="mb-1 h-6 w-6" />
                <span className="font-bold">View AR Evacuation Route</span>
                <span className="text-xs font-normal">
                  Shows camera-based navigation away from danger
                </span>
              </div>
            </Button>
          </motion.div>

          {/* Safety Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="mb-2 font-semibold">Safety Tips:</h3>
            <ul className="space-y-2">
              {getSafetyTips().map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start"
                >
                  <span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-800">
                    {index + 1}
                  </span>
                  <span className="text-sm">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <Separator />

          {/* Nearby Shelters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h3 className="mb-2 font-semibold">Nearby Shelters:</h3>
            <div className="space-y-2">
              {nearbyShelters.map((shelter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="group flex items-center justify-between rounded-md border border-slate-200 p-2 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{shelter.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shelter.address} ({shelter.distance})
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <Separator />

          {/* Send to SMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="flex items-center mb-2">
              <Smartphone className="mr-2 h-4 w-4 text-slate-500" />
              <h3 className="font-semibold">Send to Phone:</h3>
            </div>
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex space-x-2"
                >
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Button
                    onClick={handleSendSMS}
                    disabled={isSending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isSending ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-green-50 p-3 text-green-800"
                >
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    <span className="font-medium">
                      Safety tips sent to {phoneNumber}
                    </span>
                  </div>
                  <p className="mt-1 text-xs">
                    You'll receive SMS updates for this disaster event.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="mt-1 text-xs text-muted-foreground">
              Standard message and data rates may apply.
            </p>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
