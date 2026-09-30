"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"


export function BackgroundBubbles() {
  const pathname = usePathname()

  // Generate slightly different positions based on pathname length
  const hash = pathname.length
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
      {/* Bubble 1: Top Right */}
      <motion.div
        key={`bubble1-${pathname}`}
        initial={{ opacity: 0, x: 100, y: -50, scale: 0.8 }}
        animate={{ 
          opacity: 0.5, 
          x: hash % 2 === 0 ? 0 : 50, 
          y: hash % 3 === 0 ? 20 : -20,
          scale: 1 
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-slate-200/50 blur-3xl opacity-50"
      />
      
      {/* Bubble 2: Bottom Left */}
      <motion.div
        key={`bubble2-${pathname}`}
        initial={{ opacity: 0, x: -100, y: 50, scale: 0.8 }}
        animate={{ 
          opacity: 0.4, 
          x: hash % 2 === 0 ? -20 : 0, 
          y: hash % 3 === 0 ? 0 : 30,
          scale: 1 
        }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute -bottom-[10%] -left-[5%] w-[35vw] h-[35vw] rounded-full bg-slate-300/40 blur-3xl opacity-40"
      />

      {/* Bubble 3: Middle (Subtle) */}
      <motion.div
        key={`bubble3-${pathname}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 0.3,
          x: hash % 4 === 0 ? 30 : -30,
          scale: 1 
        }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
        className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-slate-200/30 blur-3xl opacity-30"
      />
    </div>
  )
}
