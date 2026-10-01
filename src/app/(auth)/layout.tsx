import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-slate-950">
      {children}
    </div>
  )
}
