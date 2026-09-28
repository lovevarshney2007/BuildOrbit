"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
}

/**
 * AppShell composes the Sidebar and Header into a full application layout.
 * It owns the mobile sidebar open/close state and the sidebar collapsed state
 * (via the Sidebar's own internal state, synced here for the Header offset).
 *
 * Usage: wrap any protected page's content with <AppShell pageTitle="...">
 */
export function AppShell({ children, pageTitle }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  // We track collapsed externally so the Header can adjust its left offset.
  // The Sidebar itself manages toggle, but we mirror via a shared ref-less approach:
  // the Header receives a prop, and the Sidebar's CSS transition handles the visual.
  // A real sync would use a context — deferred until needed.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar — fixed, left */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main area — offset right by sidebar width */}
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col",
          "transition-[margin-left] duration-200 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        {/* Top header */}
        <Header
          pageTitle={pageTitle}
          onMobileMenuOpen={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page content — padded below the fixed header */}
        <main
          id="main-content"
          className="mt-14 flex-1 px-6 py-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
