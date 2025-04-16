"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Search, Locate } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const popularLocations = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Miami, FL", "Seattle, WA"]

export function LocationModal({
  onClose,
  onLocationSet,
}: {
  onClose: () => void
  onLocationSet: (location: string) => void
}) {
  const [location, setLocation] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [step, setStep] = useState<"search" | "confirm">("search")
  const [detectedLocation, setDetectedLocation] = useState("")

  const handleDetectLocation = () => {
    setIsDetecting(true)
    // Simulate geolocation detection
    setTimeout(() => {
      const detected = "San Francisco, CA"
      setDetectedLocation(detected)
      setLocation(detected)
      setIsDetecting(false)
      setStep("confirm")
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      onLocationSet(location)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Location</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "search" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city, state or zip code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use My Current Location
                    </>
                  )}
                </Button>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Popular Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {popularLocations.map((loc) => (
                      <motion.div key={loc} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(loc)}
                          className="rounded-full"
                        >
                          {loc}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!location.trim()} className="bg-red-600 hover:bg-red-700">
                    Set Location
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Locate className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-1 text-lg font-medium">Location Detected</h3>
                <p className="text-sm text-muted-foreground">We've detected your location as:</p>
                <p className="mt-2 text-xl font-bold">{detectedLocation}</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setStep("search")}>
                  Change
                </Button>
                <Button
                  type="button"
                  onClick={() => onLocationSet(detectedLocation)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Location
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
