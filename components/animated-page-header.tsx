"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Shield } from "lucide-react"
import Link from "next/link"

interface AnimatedPageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backUrl?: string
  children?: React.ReactNode
}

export function AnimatedPageHeader({
  title,
  description,
  showBackButton = false,
  backUrl = "/dashboard",
  children,
}: AnimatedPageHeaderProps) {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 100], [1, 0.3])
  const scale = useTransform(scrollY, [0, 100], [1, 0.95])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className="relative mb-8 rounded-xl bg-gradient-to-r from-slate-900 to-red-900 p-8 text-white shadow-lg"
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {showBackButton && (
              <Link
                href={backUrl}
                className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                ←
              </Link>
            )}
            <Shield className="h-6 w-6 text-red-400" />
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          </div>
          {description && <p className="max-w-2xl text-slate-200">{description}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </motion.div>
  )
}
