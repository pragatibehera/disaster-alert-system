"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface AnimatedSectionHeaderProps {
  title: string
  subtitle?: string
  centered?: boolean
  delay?: number
}

export function AnimatedSectionHeader({ title, subtitle, centered = true, delay = 0 }: AnimatedSectionHeaderProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <div ref={ref} className={`mb-12 space-y-4 ${centered ? "text-center" : ""}`}>
      <motion.h2
        className="text-3xl font-bold tracking-tight md:text-4xl"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              delay,
            },
          },
        }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          className="mx-auto max-w-2xl text-muted-foreground"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                delay: delay + 0.2,
              },
            },
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
