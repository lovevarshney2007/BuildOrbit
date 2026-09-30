"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Orbit, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <Orbit className="size-5 text-white" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-semibold text-foreground">
              BuildOrbit
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Sign in to your workspace
            </p>
          </div>
        </div>

        {/* Form error banner */}
        {state?.message && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700"
          >
            {state.message}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[13px] font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@buildorbit.dev"
              className="h-9 w-full rounded-md border border-border bg-white px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {state?.errors?.email && (
              <p className="text-[12px] text-red-600">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[13px] font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-9 w-full rounded-md border border-border bg-white px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {state?.errors?.password && (
              <p className="text-[12px] text-red-600">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={pending}
            className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-[13px] font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-[12px] text-muted-foreground">
        BuildOrbit — Workforce &amp; HR Management
      </p>
    </div>
  )
}
