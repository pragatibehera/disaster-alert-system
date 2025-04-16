"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">

      <img src="/hello.png" alt="Disaster Alert Background" />
    </div>
  );
}
