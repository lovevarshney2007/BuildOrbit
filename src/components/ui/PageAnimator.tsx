"use client"

import { motion } from "framer-motion"

export function PageAnimator({ children, isSplashFinished = true }: { children: React.ReactNode, isSplashFinished?: boolean }) {
  return (
    <motion.div
      className="flex-1 flex flex-col w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={isSplashFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCard({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  )
}
