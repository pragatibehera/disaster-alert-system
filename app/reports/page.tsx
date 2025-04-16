"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, ChevronLeft, MapPin, Shield, Upload, X, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AnimatedPageHeader } from "@/components/animated-page-header"

export default function ReportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [location, setLocation] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
    disasterType: "",
    location: "",
    severity: "",
    description: "",
    image: null,
  })

  const handleLocationDetect = () => {
    // Simulate geolocation detection
    setLocation("Detecting location...")
    setTimeout(() => {
      const detectedLocation = "San Francisco, CA"
      setLocation(detectedLocation)
      setFormData((prev) => ({ ...prev, location: detectedLocation }))
    }, 1500)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData((prev) => ({ ...prev, image: file }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. It will help others in your area.",
      })
      router.push("/dashboard")
    }, 2000)
  }

  const nextStep = () => {
    setFormStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setFormStep((prev) => prev - 1)
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        <div className="container max-w-2xl">
          <AnimatedPageHeader
            title="Submit Disaster Report"
            description="Help your community by reporting disaster conditions in your area."
            showBackButton
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Submit Disaster Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {formStep === 0 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Disaster Type */}
                        <div className="space-y-2">
                          <Label htmlFor="disaster-type">Disaster Type</Label>
                          <Select
                            value={formData.disasterType}
                            onValueChange={(value) => updateFormData("disasterType", value)}
                            required
                          >
                            <SelectTrigger id="disaster-type">
                              <SelectValue placeholder="Select disaster type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flood">Flood</SelectItem>
                              <SelectItem value="earthquake">Earthquake</SelectItem>
                              <SelectItem value="wildfire">Wildfire</SelectItem>
                              <SelectItem value="hurricane">Hurricane/Cyclone</SelectItem>
                              <SelectItem value="tornado">Tornado</SelectItem>
                              <SelectItem value="landslide">Landslide</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="location"
                              placeholder="Enter location"
                              value={location}
                              onChange={(e) => {
                                setLocation(e.target.value)
                                updateFormData("location", e.target.value)
                              }}
                              required
                              className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={handleLocationDetect}>
                              <MapPin className="mr-2 h-4 w-4" />
                              Detect
                            </Button>
                          </div>
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                          <Label htmlFor="severity">Severity</Label>
                          <Select
                            value={formData.severity}
                            onValueChange={(value) => updateFormData("severity", value)}
                            required
                          >
                            <SelectTrigger id="severity">
                              <SelectValue placeholder="Select severity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Minor Impact</SelectItem>
                              <SelectItem value="medium">Medium - Moderate Impact</SelectItem>
                              <SelectItem value="high">High - Severe Impact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={!formData.disasterType || !formData.location || !formData.severity}
                        >
                          Next Step
                          <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                      </motion.div>
                    )}

                    {formStep === 1 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe what you're seeing..."
                            value={formData.description}
                            onChange={(e) => updateFormData("description", e.target.value)}
                            required
                            rows={4}
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                          <Label htmlFor="image">Upload Image (Optional)</Label>
                          <div className="grid gap-4">
                            <div className="flex items-center justify-center">
                              {imagePreview ? (
                                <div className="relative">
                                  <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="h-48 w-full rounded-md object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    onClick={() => {
                                      setImagePreview(null)
                                      updateFormData("image", null)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                                </motion.div>
                              )}
                            </div>
                            <Input
                              ref={fileInputRef}
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="group"
                            >
                              <Upload className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                              Upload Image
                            </Button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting || !formData.description}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Submitting...
                              </>
                            ) : (
                              "Submit Report"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
