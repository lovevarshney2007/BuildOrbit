"use client"

import { useActionState, useState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)
  const [email, setEmail] = useState("admin@buildorbit.dev")
  const [password, setPassword] = useState("Password@123")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex-1 flex overflow-hidden min-h-screen bg-surface-container-lowest dark:bg-slate-950">
      
      {/* Left side: Pixelated/Grid Visuals */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center overflow-hidden bg-[#0F172A]">
        {/* Pixel/Grid Background Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #4f46e5 2px, transparent 2px), linear-gradient(to bottom, #4f46e5 2px, transparent 2px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/80 via-transparent to-[#0F172A] z-0"></div>

        {/* Decorative Pixel Blocks */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-indigo-500/20 backdrop-blur-sm grid grid-cols-4 grid-rows-4 z-0 gap-1 opacity-50">
          {[...Array(16)].map((_, i) => (
            <div key={i} className={`bg-indigo-400 ${i % 3 === 0 ? 'opacity-100' : 'opacity-20'}`}></div>
          ))}
        </div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-cyan-500/10 backdrop-blur-sm grid grid-cols-5 grid-rows-5 z-0 gap-1 opacity-40">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`bg-cyan-400 ${i % 5 === 0 || i % 7 === 0 ? 'opacity-100' : 'opacity-10'}`}></div>
          ))}
        </div>

        <div className="relative z-10 max-w-xl p-12 text-white w-full">
          <div className="inline-flex items-center gap-3 mb-10 bg-white dark:bg-slate-950/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-[24px]">orbit</span>
            </div>
            <span className="text-xl font-bold tracking-tight">BuildOrbit</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6">
            The operating system for your workforce.
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 leading-relaxed mb-12 max-w-lg">
            Sign in to access unified workforce management, multi-entity payroll, and client records securely.
          </p>

          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm w-fit">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-indigo-600 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-white text-[18px]">person</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-400">
              Join <strong className="text-white">10,000+</strong> teams globally
            </div>
          </div>
        </div>
      </div>

      {/* Right side: The Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-surface-container-lowest dark:bg-slate-950">
        <div className="w-full max-w-[420px]">
          
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight mb-2">Welcome back</h2>
            <p className="font-body-md text-body-md text-secondary dark:text-slate-400">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Demo Credentials Helper */}
          <div className="mb-8 p-4 bg-primary-fixed border border-primary-fixed-dim rounded-xl text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <p className="font-semibold text-on-primary-fixed">Demo Credentials</p>
            </div>
            <ul className="list-disc list-inside text-on-primary-fixed opacity-90 space-y-1 ml-1">
              <li>Admin: <b>admin@buildorbit.dev</b> / Password@123</li>
              <li>HR: <b>hr@buildorbit.dev</b> / Password@123</li>
            </ul>
          </div>

          {state?.message && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
              <span>{state.message}</span>
            </div>
          )}

          <form action={action} className="space-y-6">
            <div>
              <label className="block font-label-md text-label-md text-on-surface dark:text-white font-medium mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input 
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant dark:border-slate-800 hover:border-outline rounded-xl font-body-md text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  id="email" 
                  name="email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-sm text-red-600 mt-2">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md text-on-surface dark:text-white font-medium" htmlFor="password">
                  Password
                </label>
                <a href="#" className="font-label-sm text-label-sm text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  className="w-full h-12 px-4 pr-11 bg-surface-bright border border-outline-variant dark:border-slate-800 hover:border-outline rounded-xl font-body-md text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button 
                  className="absolute right-3 top-3 text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white p-0.5 rounded focus:outline-none transition-colors flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-sm text-red-600 mt-2">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <span className="text-secondary dark:text-slate-400 font-body-sm text-body-sm">Don&apos;t have an account? </span>
              <Link href="/register" className="font-label-sm text-label-sm text-primary hover:underline font-semibold">
                Register here
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
