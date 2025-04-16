"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90 z-10"
      />
      <video ref={videoRef} autoPlay muted loop playsInline className="h-full w-full object-cover">
        <source src="https://v0.blob.com/disaster-alert-bg.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
