"use client"

import { Menu, Bell, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  /** Page title — passed from each page via the layout */
  pageTitle?: string
  /** Called when the mobile menu button is tapped */
  onMobileMenuOpen: () => void
  /** Whether sidebar is in collapsed state — used to offset the header */
  sidebarCollapsed?: boolean
}

export function Header({
  pageTitle,
  onMobileMenuOpen,
  sidebarCollapsed = false,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className={cn(
        // Sticky top bar, full width minus sidebar
        "fixed right-0 top-0 z-20 flex h-14 items-center border-b border-[#E2E8F0] bg-white",
        "transition-[left] duration-200 ease-in-out",
        // Offset left to match sidebar width
        sidebarCollapsed ? "left-16" : "left-0 lg:left-60",
      )}
    >
      <div className="flex w-full items-center gap-3 px-4">
        {/* ---- Mobile menu button ---- */}
        <button
          id="mobile-menu-button"
          aria-label="Open navigation menu"
          aria-controls="app-sidebar"
          onClick={onMobileMenuOpen}
          className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {/* ---- Page title (shown on desktop) ---- */}
        {pageTitle && (
          <h1 className="hidden truncate text-[15px] font-semibold text-[#1E293B] lg:block">
            {pageTitle}
          </h1>
        )}

        {/* ---- Spacer ---- */}
        <div className="flex-1" />

        {/* ---- Search button ---- */}
        <button
          id="header-search-button"
          aria-label="Search"
          className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>

        {/* ---- Notifications ---- */}
        <button
          id="header-notifications-button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="size-4" aria-hidden="true" />
          {/* Notification dot — placeholder */}
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-500"
          />
        </button>

        {/* ---- Divider ---- */}
        <div aria-hidden="true" className="h-5 w-px bg-[#E2E8F0]" />

        {/* ---- User avatar ---- */}
        <button
          id="header-user-menu-button"
          aria-label="User menu"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-[12px] font-semibold text-white hover:bg-[#0F172A]"
        >
          JD
        </button>
      </div>
    </header>
  )
}
