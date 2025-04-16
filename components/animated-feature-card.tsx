"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AnimatedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor: string
  iconBgColor: string
  delay?: number
}

export function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
  iconBgColor,
  delay = 0,
}: AnimatedFeatureCardProps) {
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
      whileHover={{
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 },
      }}
      className="flex flex-col items-center rounded-xl border bg-white p-6 text-center shadow-sm transition-all"
    >
      <div className={`mb-4 rounded-full ${iconBgColor} p-3`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}
