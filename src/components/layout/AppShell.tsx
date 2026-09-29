"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"
import type { SessionPayload } from "@/lib/session"

interface AppShellProps {
  children: React.ReactNode
  user: SessionPayload
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col",
          "transition-[margin-left] duration-200 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        <Header
          user={user}
          onMobileMenuOpen={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main id="main-content" className="mt-14 flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
