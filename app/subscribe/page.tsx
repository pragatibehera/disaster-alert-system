"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Shield, Smartphone, Bell, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AnimatedPageHeader } from "@/components/animated-page-header"

const disasterTypes = [
  { id: "flood", label: "Flood" },
  { id: "earthquake", label: "Earthquake" },
  { id: "wildfire", label: "Wildfire" },
  { id: "hurricane", label: "Hurricane/Cyclone" },
  { id: "tornado", label: "Tornado" },
  { id: "landslide", label: "Landslide" },
  { id: "tsunami", label: "Tsunami" },
]

export default function SubscribePage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedTypes, setSelectedTypes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleTypeToggle = (typeId) => {
    setSelectedTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (selectedTypes.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one disaster type.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubscribed(true)
      toast({
        title: "Subscription Successful",
        description: "You will now receive SMS alerts for the selected disaster types.",
      })
    }, 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="mr-4 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold">DisasterAlert</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-md">
          <AnimatedPageHeader
            title="SMS Alert Subscription"
            description="Get critical alerts delivered directly to your phone, even when you're offline."
            showBackButton
          />

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Subscription Confirmed</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mb-6 flex justify-center"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-10 w-10 text-green-600" />
                      </div>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mb-4"
                    >
                      You have successfully subscribed to SMS alerts for:
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="mb-6 flex flex-wrap justify-center gap-2"
                    >
                      {selectedTypes.map((type, index) => (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm"
                        >
                          {disasterTypes.find((t) => t.id === type)?.label}
                        </motion.div>
                      ))}
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="mb-6 text-sm text-muted-foreground"
                    >
                      Alerts will be sent to: {phoneNumber}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="flex space-x-4"
                    >
                      <Button variant="outline" className="flex-1" onClick={() => setSubscribed(false)}>
                        Edit Subscription
                      </Button>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => router.push("/dashboard")}>
                        Return to Dashboard
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold">
                      <Bell className="mr-2 h-5 w-5 text-red-500" />
                      Subscribe to SMS Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Phone Number */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Standard message and data rates may apply.</p>
                      </motion.div>

                      {/* Disaster Types */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="space-y-3"
                      >
                        <Label>Select Alert Types</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {disasterTypes.map((type, index) => (
                            <motion.div
                              key={type.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={type.id}
                                checked={selectedTypes.includes(type.id)}
                                onCheckedChange={() => handleTypeToggle(type.id)}
                                className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              />
                              <Label htmlFor={type.id} className="cursor-pointer text-sm font-normal">
                                {type.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={isSubmitting || !phoneNumber || selectedTypes.length === 0}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Smartphone className="mr-2 h-4 w-4" />
                              Start SMS Alerts
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="text-center text-xs text-muted-foreground"
                      >
                        By subscribing, you agree to our{" "}
                        <a href="#" className="underline hover:text-foreground">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline hover:text-foreground">
                          Privacy Policy
                        </a>
                        .
                      </motion.p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
