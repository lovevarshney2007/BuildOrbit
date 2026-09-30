"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { SessionPayload } from "@/lib/session"

interface LandingPageClientProps {
  user: SessionPayload | null
}

export function LandingPageClient({ user }: LandingPageClientProps) {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-slate-200">
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-white text-slate-900 rounded-lg shadow-sm">
              <span className="material-symbols-outlined" data-icon="orbit">orbit</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">BuildOrbit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard"
                className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold rounded-full transition-all shadow-lg hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login"
                  className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold rounded-full transition-all shadow-lg hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-32 overflow-hidden min-h-screen flex items-center">
        
        {/* Massive Curvy Background */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <svg 
            className="absolute top-0 left-0 w-full h-[120%] object-cover object-left-top origin-top-left scale-x-125 md:scale-x-100" 
            viewBox="0 0 1440 900" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 L1440,0 L1440,150 C1100,200 800,850 0,650 Z" 
              fill="url(#hero-gradient)" 
            />
            <defs>
              <linearGradient id="hero-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f172a" /> {/* slate-900 */}
                <stop offset="100%" stopColor="#1e293b" /> {/* slate-800 */}
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          
          {/* Left Column: Copy (Over the slate gradient) */}
          <div className="flex flex-col items-start text-left max-w-2xl text-white">
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              The operating system for your workforce.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Stop juggling multiple tools. Unify HR, payroll, attendance, and CRM in one powerful enterprise suite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href={user ? "/dashboard" : "/login"}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {user ? "Open Workspace" : "Get Started"}
              </Link>
            </div>
          </div>

          {/* Right Column: Visual / Dashboard Preview (Over the white background) */}
          <motion.div 
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:ml-auto w-full max-w-2xl perspective-1000 mt-20 lg:mt-0"
          >
            {/* Main App Window Mockup */}
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[4/3] flex flex-col transform hover:-translate-y-2 transition-transform duration-500">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="h-8 w-1/3 bg-slate-100 rounded-md" />
                <div className="flex gap-4 mb-4">
                  <div className="h-24 flex-1 bg-slate-50 rounded-xl border border-slate-200" />
                  <div className="h-24 flex-1 bg-slate-50 rounded-xl border border-slate-200" />
                  <div className="h-24 flex-1 bg-slate-50 rounded-xl border border-slate-200" />
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <div className="h-4 w-full bg-slate-200 rounded-sm mb-4" />
                  <div className="h-4 w-5/6 bg-slate-200 rounded-sm mb-4" />
                  <div className="h-4 w-4/6 bg-slate-200 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Floating Element 1 */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white border border-slate-100 p-4 rounded-xl shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Payroll Processed</p>
                <p className="text-xs text-slate-500">Just now</p>
              </div>
            </motion.div>

            {/* Floating Element 2 */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-10 -right-4 bg-white border border-slate-100 p-4 rounded-xl shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">New Hire Onboarded</p>
                <p className="text-xs text-slate-500">Sarah Jenkins</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Everything you need to scale</h2>
            <p className="text-slate-500 text-lg">
              Designed for precision and speed, BuildOrbit replaces your messy spreadsheets and disconnected SaaS tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Core HR", icon: "badge", desc: "Manage employee lifecycles, attendance, and leave requests effortlessly." },
              { title: "Smart Payroll", icon: "account_balance", desc: "Automated calculations, tax compliance, and one-click salary disbursement." },
              { title: "CRM Integration", icon: "hub", desc: "Track leads, manage client accounts, and link sales directly to team performance." },
            ].map((feat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mb-6 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">{feat.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2026 BuildOrbit. All rights reserved.</p>
      </footer>

    </div>
  )
}
