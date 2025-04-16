"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Alert {
  id: string
  type: string
  location: string
  coordinates: { lat: number; lng: number }
  severity: string
  timestamp: string
  distance: number
}

export function DisasterMap({ alerts }: { alerts: Alert[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      renderMap()
    }
  }, [isLoaded, alerts, hoveredAlert])

  const renderMap = () => {
    if (!mapRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = mapRef.current.clientWidth
    canvas.height = mapRef.current.clientHeight
    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw map background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#e6eef7")
    gradient.addColorStop(1, "#d9e6f2")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#c1d5e8"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw some land masses
    ctx.fillStyle = "#d9e6f2"
    // Random shapes to simulate land
    ctx.beginPath()
    ctx.moveTo(50, 50)
    ctx.bezierCurveTo(100, 20, 200, 80, 300, 40)
    ctx.bezierCurveTo(400, 90, 500, 30, 600, 70)
    ctx.lineTo(600, 200)
    ctx.bezierCurveTo(550, 250, 450, 220, 400, 280)
    ctx.bezierCurveTo(300, 320, 200, 290, 100, 330)
    ctx.lineTo(50, 200)
    ctx.closePath()
    ctx.fill()

    // Add some texture to the map
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 2 + 1
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)"
      ctx.fill()
    }

    // Draw alerts
    alerts.forEach((alert) => {
      // Convert alert coordinates to canvas coordinates (simplified)
      const x = (alert.coordinates.lng + 180) * (canvas.width / 360)
      const y = (90 - alert.coordinates.lat) * (canvas.height / 180)

      // Draw alert marker
      const isHovered = hoveredAlert === alert.id
      const radius = isHovered
        ? alert.severity === "high"
          ? 18
          : alert.severity === "medium"
            ? 15
            : 12
        : alert.severity === "high"
          ? 15
          : alert.severity === "medium"
            ? 12
            : 8

      // Outer circle (pulse effect for severe alerts)
      if (alert.severity === "high") {
        ctx.beginPath()
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)"
        ctx.fill()
      }

      // Main circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = alert.severity === "high" ? "#ef4444" : alert.severity === "medium" ? "#f59e0b" : "#22c55e"
      ctx.fill()

      // Inner circle
      ctx.beginPath()
      ctx.arc(x, y, radius / 2, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.fill()

      // Add icon based on disaster type
      ctx.fillStyle = "#000"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      let icon = "⚠️"
      switch (alert.type.toLowerCase()) {
        case "flood":
          icon = "💧"
          break
        case "earthquake":
          icon = "🌋"
          break
        case "wildfire":
          icon = "🔥"
          break
        case "hurricane":
          icon = "🌀"
          break
        case "tornado":
          icon = "🌪️"
          break
      }

      ctx.fillText(icon, x, y)

      // Add tooltip for hovered alert
      if (isHovered) {
        const tooltipWidth = 150
        const tooltipHeight = 40
        const tooltipX = x - tooltipWidth / 2
        const tooltipY = y - radius - tooltipHeight - 10

        // Draw tooltip background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.beginPath()
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4)
        ctx.fill()

        // Draw tooltip text
        ctx.fillStyle = "#fff"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(alert.type, x, tooltipY + 15)
        ctx.font = "10px sans-serif"
        ctx.fillText(alert.location, x, tooltipY + 30)

        // Draw tooltip pointer
        ctx.beginPath()
        ctx.moveTo(x, tooltipY + tooltipHeight)
        ctx.lineTo(x - 8, tooltipY + tooltipHeight)
        ctx.lineTo(x, tooltipY + tooltipHeight + 8)
        ctx.lineTo(x + 8, tooltipY + tooltipHeight)
        ctx.closePath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fill()
      }
    })

    // Draw user location
    const userX = canvas.width / 2
    const userY = canvas.height / 2

    // User location marker
    ctx.beginPath()
    ctx.arc(userX, userY, 8, 0, Math.PI * 2)
    ctx.fillStyle = "#3b82f6"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(userX, userY, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    // Pulse effect for user location
    ctx.beginPath()
    ctx.arc(userX, userY, 12, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Add event listeners to canvas for interactivity
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Check if mouse is over any alert
      let hoveredId = null
      for (const alert of alerts) {
        const x = (alert.coordinates.lng + 180) * (canvas.width / 360)
        const y = (90 - alert.coordinates.lat) * (canvas.height / 180)
        const radius = alert.severity === "high" ? 15 : alert.severity === "medium" ? 12 : 8

        const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2))
        if (distance <= radius) {
          hoveredId = alert.id
          break
        }
      }

      if (hoveredId !== hoveredAlert) {
        setHoveredAlert(hoveredId)
      }
    }

    canvas.onmouseleave = () => {
      setHoveredAlert(null)
    }
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-b-lg bg-slate-100">
      <div ref={mapRef} className="h-full w-full">
        {!isLoaded && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-600" />
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
        >
          -
        </motion.button>
      </div>

      {/* Map Legend */}
      <div className="absolute left-4 top-4 rounded-lg bg-white/90 p-2 shadow-md backdrop-blur-sm">
        <p className="mb-1 text-xs font-medium">Alert Severity</p>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}
