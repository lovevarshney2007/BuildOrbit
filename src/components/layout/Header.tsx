"use client"

import { Menu, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SessionPayload } from "@/lib/session"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  HR: "HR",
  LEAD: "Lead",
  ENGINEER: "Engineer",
}

interface HeaderProps {
  user: SessionPayload
  onMobileMenuOpen: () => void
  sidebarCollapsed?: boolean
}

export function Header({
  user,
  onMobileMenuOpen,
  sidebarCollapsed = false,
}: HeaderProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <header
      id="app-header"
      className={cn(
        "fixed right-0 top-0 z-20 flex h-14 items-center border-b border-[#E2E8F0] bg-white",
        "transition-[left] duration-200 ease-in-out",
        sidebarCollapsed ? "left-16" : "left-0 lg:left-60",
      )}
    >
      <div className="flex w-full items-center gap-3 px-4">
        {/* Mobile menu button */}
        <button
          id="mobile-menu-button"
          aria-label="Open navigation menu"
          aria-controls="app-sidebar"
          onClick={onMobileMenuOpen}
          className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notifications placeholder */}
        <button
          id="header-notifications-button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>

        {/* Divider */}
        <div aria-hidden="true" className="h-5 w-px bg-[#E2E8F0]" />

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="hidden text-right lg:block">
            <p className="text-[13px] font-medium text-[#1E293B]">
              {user.name || user.email}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
          <div
            aria-label={`User menu: ${user.name || user.email}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-[12px] font-semibold text-white"
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
