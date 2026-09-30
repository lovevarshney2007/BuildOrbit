"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Exactly 1 second duration
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-graphite"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-hidden"
        >
          {/* Top Dark Slate Section with Curve */}
          <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center pb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center gap-4 text-white"
            >
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-slate-800 shadow-2xl text-slate-100 border border-slate-700">
                <span className="material-symbols-outlined text-4xl" data-icon="orbit">
                  orbit
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mt-2">BuildOrbit</h1>
            </motion.div>

            {/* Curvy Wave SVG Divider matching the bottom background */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
              <svg className="relative block w-full h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3.58V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f8fafc"></path>
              </svg>
            </div>
          </div>

          {/* Bottom Light Section with snappy text animation */}
          <div className="h-1/3 bg-slate-50 flex flex-col items-center justify-center relative">
            <div className="h-10 w-full flex items-center justify-center overflow-hidden">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-xl font-semibold tracking-widest uppercase text-slate-800"
              >
                Initializing Workspace
              </motion.h2>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
