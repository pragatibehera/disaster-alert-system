"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  delay?: number
  iconColor?: string
  iconBgColor?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  delay = 0,
  iconColor = "text-red-500",
  iconBgColor = "bg-red-100",
}: StatCardProps) {
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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.h3
                className="mt-2 text-3xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
              >
                {value}
              </motion.h3>
              {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
              {trend && (
                <div className="mt-2 flex items-center">
                  <span
                    className={`mr-1 text-xs font-medium ${
                      trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    {trendValue}
                  </span>
                  <span
                    className={`text-xs ${
                      trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              )}
            </div>
            <div className={`rounded-full ${iconBgColor} p-3`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
