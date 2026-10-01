"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"
import type { SessionPayload } from "@/lib/session"
import { BackgroundBubbles } from "@/components/ui/BackgroundBubbles"
import { PageAnimator } from "@/components/ui/PageAnimator"
import { SplashScreen } from "@/components/ui/SplashScreen"

interface AppShellProps {
  children: React.ReactNode
  user: SessionPayload
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isSplashFinished, setIsSplashFinished] = useState(false)

  return (
    <div className="flex w-full flex-1 min-h-screen bg-transparent text-on-surface dark:text-white antialiased flex-row relative z-0">
      <SplashScreen onFinish={() => setIsSplashFinished(true)} />
      <BackgroundBubbles />
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        isSplashFinished={isSplashFinished}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-transparent",
          "transition-[margin-left] duration-200 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        <Header
          user={user}
          onMobileMenuOpen={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <PageAnimator isSplashFinished={isSplashFinished}>
          <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-6 pb-10 flex flex-col gap-8 max-w-[1920px] mx-auto w-full">
            {children}
          </main>
        </PageAnimator>
      </div>
    </div>
  )
}

