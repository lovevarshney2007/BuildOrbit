"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function LandingPage() {
  // A grid of pixels that will randomly blink to give that pixel art/tech vibe
  const renderPixels = () => {
    return Array.from({ length: 40 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "steps(2)",
        }}
        className="w-4 h-4 bg-blue-500/30 rounded-sm"
        style={{
          position: "absolute",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))
  }

  return (
    <div className="w-full flex-1 min-h-screen bg-slate-950 flex flex-col overflow-hidden font-mono relative selection:bg-slate-500/30 text-slate-200">
      {/* Background Pixel Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />
      </div>

      {/* Floating Pixels */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {renderPixels()}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-sm">
            <span className="material-symbols-outlined text-white" data-icon="orbit">orbit</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">BUILD<span className="text-blue-500">ORBIT</span></span>
        </div>
        <Link 
          href="/dashboard"
          className="px-6 py-2.5 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all text-sm font-semibold tracking-wide uppercase rounded-sm"
        >
          Enter Suite
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        
        {/* Pixelated / Blocky Huge Text */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-sm">
            System v4.8 Active
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none mb-6">
            <span className="inline-block bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">
              WORK
            </span>
            <span className="inline-block text-slate-500">
              FORCE
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-2xl text-slate-400 mb-10 leading-relaxed font-sans">
            The next-generation enterprise suite. Unify your HR, payroll, and CRM into one powerfully simple terminal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold tracking-widest uppercase transition-all rounded-sm flex items-center gap-3 group relative overflow-hidden"
            >
              <span className="relative z-10">Initialize Workspace</span>
              <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              {/* Glitch effect on hover */}
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-slate-300 font-bold tracking-widest uppercase transition-all rounded-sm"
            >
              Admin Auth
            </Link>
          </div>
        </motion.div>

      </main>

      {/* Decorative Bottom Bar */}
      <div className="h-2 w-full bg-slate-900 flex">
        <div className="h-full w-1/3 bg-blue-600" />
        <div className="h-full w-1/6 bg-indigo-500" />
      </div>
    </div>
  )
}
