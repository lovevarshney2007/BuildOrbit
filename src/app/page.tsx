"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-slate-700/50">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto px-6 py-4 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-slate-100 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-slate-900" data-icon="orbit">orbit</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">BuildOrbit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-900 text-sm font-semibold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left Column: Copy */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-300 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              BuildOrbit v4.8 is now live
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              The operating system for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">workforce.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              Stop juggling multiple tools. Unify HR, payroll, attendance, and CRM in one powerful, graphite-themed enterprise suite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Enter Dashboard
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
              <Link 
                href="/login"
                className="flex items-center justify-center px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white font-medium rounded-xl transition-all"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* Right Column: Visual / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:ml-auto w-full max-w-2xl perspective-1000"
          >
            {/* Main App Window Mockup */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl overflow-hidden aspect-[4/3] flex flex-col transform hover:-translate-y-2 transition-transform duration-500">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="h-8 w-1/3 bg-slate-800 rounded-md" />
                <div className="flex gap-4 mb-4">
                  <div className="h-24 flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50" />
                  <div className="h-24 flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50" />
                  <div className="h-24 flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50" />
                </div>
                <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-800/50 p-4">
                  <div className="h-4 w-full bg-slate-700/50 rounded-sm mb-4" />
                  <div className="h-4 w-5/6 bg-slate-700/50 rounded-sm mb-4" />
                  <div className="h-4 w-4/6 bg-slate-700/50 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Floating Element 1 */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Payroll Processed</p>
                <p className="text-xs text-slate-400">Just now</p>
              </div>
            </motion.div>

            {/* Floating Element 2 */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-10 -right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">New Hire Onboarded</p>
                <p className="text-xs text-slate-400">Sarah Jenkins</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      {/* Feature Grid Section (allows scrolling!) */}
      <section id="features" className="py-32 bg-slate-950 border-t border-slate-900">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Everything you need to scale</h2>
            <p className="text-slate-400 text-lg">
              Designed for precision and speed, BuildOrbit replaces your messy spreadsheets and disconnected SaaS tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Core HR", icon: "badge", desc: "Manage employee lifecycles, attendance, and leave requests effortlessly." },
              { title: "Smart Payroll", icon: "account_balance", desc: "Automated calculations, tax compliance, and one-click salary disbursement." },
              { title: "CRM Integration", icon: "hub", desc: "Track leads, manage client accounts, and link sales directly to team performance." },
            ].map((feat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-900 transition-colors">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 mb-6">
                  <span className="material-symbols-outlined">{feat.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-center text-slate-500 text-sm">
        <p>© 2026 BuildOrbit. All rights reserved.</p>
      </footer>

    </div>
  )
}
