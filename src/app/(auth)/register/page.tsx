"use client"

import { useActionState, useState, Suspense, useEffect } from "react"
import { sendOtpAction, verifyOtpAction, resendOtpAction, acceptInviteAction } from "@/lib/actions/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function RegisterForm() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("token")
  const inviteEmail = searchParams.get("email")

  const [inviteState, inviteAction, invitePending] = useActionState(acceptInviteAction, null)
  const [sendState, sendAction, sendPending] = useActionState(sendOtpAction, null)
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpAction, null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState(inviteEmail || "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    if (inviteEmail) setEmail(inviteEmail)
  }, [inviteEmail])

  const step = verifyState?.step || sendState?.step || "REGISTER"
  const isOtpStep = step === "VERIFY_OTP" && !inviteToken
  
  const activeData = verifyState?.data || sendState?.data || {}

  const handleResend = async () => {
    if (!activeData.email) return
    setResending(true)
    setResendMessage("")
    try {
      const res = await resendOtpAction(activeData.email)
      setResendMessage(res.message)
    } catch (_e) {
      setResendMessage("Failed to resend OTP.")
    } finally {
      setResending(false)
    }
  }

  const activeAction = inviteToken ? inviteAction : sendAction
  const isPending = inviteToken ? invitePending : sendPending
  const activeState = inviteToken ? inviteState : sendState

  return (
    <div className="flex-1 flex overflow-hidden min-h-screen bg-surface-container-lowest dark:bg-slate-950">
      
      <div className="hidden lg:flex w-[55%] relative items-center justify-center overflow-hidden bg-[#0F172A]">
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #10b981 2px, transparent 2px), linear-gradient(to bottom, #10b981 2px, transparent 2px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/80 via-transparent to-[#0F172A] z-0"></div>

        <div className="absolute top-20 left-20 w-20 h-20 bg-slate-900/20 backdrop-blur-sm grid grid-cols-4 grid-rows-4 z-0 gap-1 opacity-50">
          {[...Array(16)].map((_, i) => (
            <div key={i} className={`bg-slate-800 ${i % 3 === 0 ? 'opacity-100' : 'opacity-20'}`}></div>
          ))}
        </div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-teal-500/10 backdrop-blur-sm grid grid-cols-5 grid-rows-5 z-0 gap-1 opacity-40">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`bg-teal-400 ${i % 5 === 0 || i % 7 === 0 ? 'opacity-100' : 'opacity-10'}`}></div>
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
            Join the future of enterprise management.
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 leading-relaxed mb-12 max-w-lg">
            Create an account to experience seamless workforce and payroll synchronization.
          </p>

          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm w-fit">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-900">
              <span className="material-symbols-outlined text-white text-[18px]">verified_user</span>
            </div>
            <div className="text-sm text-slate-400">
              Secure, compliant, and ready for scale.
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-surface-container-lowest dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-[420px] py-12">
          
          {!isOtpStep ? (
            <>
              <div className="mb-8">
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight mb-2">Create an account</h2>
                <p className="font-body-md text-body-md text-secondary dark:text-slate-400">
                  {inviteToken ? "Set your password to accept the invitation." : "Enter your details to get started."}
                </p>
              </div>

              {activeState?.message && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                  <span>{activeState.message}</span>
                </div>
              )}

              <form action={activeAction} className="space-y-6">
                {inviteToken && <input type="hidden" name="token" value={inviteToken} />}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface dark:text-white font-medium mb-1.5" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full h-12 px-4 bg-surface-bright border border-outline-variant dark:border-slate-800 hover:border-outline rounded-xl font-body-md text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      id="name" 
                      name="name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  {activeState?.errors?.name && (
                    <p className="text-sm text-red-600 mt-2">
                      {activeState.errors.name[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface dark:text-white font-medium mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full h-12 px-4 bg-surface-bright border border-outline-variant dark:border-slate-800 hover:border-outline rounded-xl font-body-md text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900" 
                      id="email" 
                      name="email"
                      type="email" 
                      required
                      value={email}
                      readOnly={!!inviteEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                    />
                  </div>
                  {activeState?.errors?.email && (
                    <p className="text-sm text-red-600 mt-2">
                      {activeState.errors.email[0]}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block font-label-md text-label-md text-on-surface dark:text-white font-medium mb-1.5" htmlFor="password">
                    Password
                  </label>
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
                  {activeState?.errors?.password && (
                    <p className="text-sm text-red-600 mt-2">
                      {activeState.errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        <span>{inviteToken ? "Creating Account..." : "Sending OTP..."}</span>
                      </>
                    ) : (
                      <span>{inviteToken ? "Accept Invitation & Register" : "Register"}</span>
                    )}
                  </button>
                </div>
                
                <div className="text-center pt-2">
                  <span className="text-secondary dark:text-slate-400 font-body-sm text-body-sm">Already have an account? </span>
                  <Link href="/login" className="font-label-sm text-label-sm text-primary hover:underline font-semibold">
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="mb-8">
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight mb-2">Check your email</h2>
                <p className="font-body-md text-body-md text-secondary dark:text-slate-400">
                  We sent a 6-digit verification code to <span className="font-medium text-on-surface dark:text-white">{activeData.email}</span>.
                </p>
              </div>

              {verifyState?.message && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                  <span>{verifyState.message}</span>
                </div>
              )}
              {resendMessage && (
                <div role="alert" className="mb-6 rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 p-4 text-sm text-slate-950 flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-900 dark:text-white shrink-0">check_circle</span>
                  <span>{resendMessage}</span>
                </div>
              )}

              <form action={verifyAction} className="space-y-6">
                <input type="hidden" name="name" value={activeData.name} />
                <input type="hidden" name="email" value={activeData.email} />
                <input type="hidden" name="password" value={activeData.password} />

                <div>
                  <label className="block font-label-md text-label-md text-on-surface dark:text-white font-medium mb-1.5" htmlFor="otp">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full h-12 px-4 bg-surface-bright border border-outline-variant dark:border-slate-800 hover:border-outline rounded-xl font-body-lg text-body-lg tracking-[0.2em] text-center text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      id="otp" 
                      name="otp"
                      type="text" 
                      maxLength={6}
                      required
                      placeholder="123456"
                    />
                  </div>
                  {verifyState?.errors?.otp && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      {verifyState.errors.otp[0]}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={verifyPending}
                  >
                    {verifyPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify and Create Account</span>
                    )}
                  </button>
                </div>
                
                <div className="text-center pt-2 flex flex-col items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-label-sm text-label-sm text-primary hover:underline font-semibold disabled:opacity-50 disabled:no-underline"
                  >
                    {resending ? "Resending..." : "Didn't receive the code? Resend"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => window.location.reload()}
                    className="font-label-sm text-label-sm text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
