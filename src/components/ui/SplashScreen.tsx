"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const LOADING_STEPS = [
  "Initializing BuildOrbit Kernel...",
  "Loading Enterprise Modules...",
  "Synchronizing HR & Payroll Data...",
  "Establishing Secure Connection...",
  "Optimizing Workspace...",
  "Ready."
]

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    // Sequence through the loading steps
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 350) // Change text every 350ms

    // Hide splash screen after sequence
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2800)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ y: 0 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
        >
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

          <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
            {/* Top Brand Identity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
                <span className="material-symbols-outlined text-3xl text-slate-300 relative z-10" data-icon="orbit">
                  orbit
                </span>
                <motion.div
                  animate={{ y: ["100%", "-100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-500/20 to-transparent"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">BuildOrbit</h1>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Enterprise Suite v4.8</p>
              </div>
            </motion.div>

            {/* Loading Bar Container */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="w-full bg-slate-900 rounded-full h-1.5 mb-6 overflow-hidden border border-slate-800"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2.2, ease: "circOut" }}
                className="h-full w-full bg-slate-400 rounded-full"
              />
            </motion.div>

            {/* Dynamic Loading Text */}
            <div className="h-6 w-full flex justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13px] font-mono text-slate-400"
                >
                  {LOADING_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            
            {/* Additional Technical Details / Skeleton illusion */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex items-center justify-between w-full gap-4 opacity-30"
            >
              <div className="h-2 w-1/3 bg-slate-700 rounded-full" />
              <div className="h-2 w-1/4 bg-slate-700 rounded-full" />
              <div className="h-2 w-1/6 bg-slate-700 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
