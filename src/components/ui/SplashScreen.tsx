"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const HR_MESSAGES = [
  "Empowering Your Workforce",
  "Streamlining HR & Payroll",
  "Optimizing Team Performance",
  "Accelerating Growth"
]

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    // Cycle through HR messages
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % HR_MESSAGES.length)
    }, 700)

    // Hide splash screen after sequence completes
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3200)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-blue-white"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden"
        >
          {/* Top Blue Gradient Section with Curve */}
          <div className="relative flex-1 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 flex flex-col items-center justify-center pb-20">
            {/* Subtle background overlay circles for texture */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
              <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-3xl" />
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center gap-6 text-white"
            >
              <div className="flex items-center justify-center h-24 w-24 rounded-[2rem] bg-white shadow-2xl text-blue-700 border-4 border-blue-100/20">
                <span className="material-symbols-outlined text-5xl" data-icon="orbit">
                  orbit
                </span>
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-5xl font-extrabold tracking-tight">BuildOrbit</h1>
                <p className="mt-2 text-blue-100 font-semibold tracking-widest uppercase text-sm">Enterprise Suite</p>
              </div>
            </motion.div>

            {/* Curvy Wave SVG Divider at the bottom of the blue section */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
              <svg className="relative block w-full h-[100px] md:h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3.58V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
              </svg>
            </div>
          </div>

          {/* Bottom White Section */}
          <div className="h-[35%] bg-white flex flex-col items-center justify-center relative">
            <div className="h-12 w-full flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={msgIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-slate-800 absolute text-center px-4"
                >
                  {HR_MESSAGES[msgIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>
            
            {/* Elegant loading dots */}
            <div className="mt-8 flex gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: ["0%", "-50%", "0%"] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-2.5 h-2.5 rounded-full bg-blue-600/40"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
