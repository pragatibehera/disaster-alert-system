"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  location: string
  delay?: number
}

export function TestimonialCard({ quote, author, location, delay = 0 }: TestimonialCardProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="flex flex-col rounded-xl bg-white p-6 shadow-md"
    >
      <Quote className="mb-4 h-8 w-8 text-red-400 opacity-50" />
      <p className="mb-4 text-slate-700">{quote}</p>
      <div className="mt-auto">
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{location}</p>
      </div>
    </motion.div>
  )
}
