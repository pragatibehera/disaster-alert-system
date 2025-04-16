"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface CounterProps {
  value: number
  label: string
  duration?: number
  delay?: number
}

export function ImpactCounter({ value, label, duration = 2, delay = 0 }: CounterProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
      }}
      className="flex flex-col items-center"
    >
      <motion.span
        className="text-4xl font-bold text-red-600 md:text-5xl"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {isInView ? <Counter from={0} to={value} duration={duration} /> : 0}
      </motion.span>
      <span className="mt-2 text-center text-sm font-medium text-slate-600 md:text-base">{label}</span>
    </motion.div>
  )
}

function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const startTime = performance.now()
    const endTime = startTime + duration * 1000

    const updateCounter = (currentTime: number) => {
      if (currentTime < endTime) {
        const elapsedTime = currentTime - startTime
        const progress = elapsedTime / (duration * 1000)
        const currentValue = Math.floor(from + progress * (to - from))

        if (node) {
          node.textContent = currentValue.toLocaleString()
        }

        requestAnimationFrame(updateCounter)
      } else {
        if (node) {
          node.textContent = to.toLocaleString()
        }
      }
    }

    requestAnimationFrame(updateCounter)

    return () => {
      if (node) {
        node.textContent = from.toString()
      }
    }
  }, [from, to, duration])

  return <span ref={nodeRef}>{from}</span>
}
