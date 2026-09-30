"use client"

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
    
  // Format current date for the context indicator
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="sticky top-4 z-20 w-full px-4 sm:px-6 lg:px-10 flex justify-center pointer-events-none transition-all duration-200 mb-6">
      <header
        id="app-header"
        className={cn(
          "pointer-events-auto h-14 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant flex items-center justify-between px-4 sm:px-6 rounded-full shadow-md w-full max-w-[1920px]",
          "transition-all duration-200 ease-in-out"
        )}
      >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuOpen}
          className="flex lg:hidden text-secondary hover:text-on-surface"
        >
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
        
        <div className="hidden lg:flex items-center gap-2 text-secondary font-label-sm text-label-sm shrink-0">
          <span className="font-semibold text-on-surface">BuildOrbit</span>
          <span className="text-outline-variant">/</span>
          <span className="text-slate-900 font-semibold">Command Center</span>
        </div>

        <div className="relative w-full max-w-sm hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-secondary">
            <span className="material-symbols-outlined" data-icon="search" style={{ fontSize: "16px" }}>search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search employees, payroll records, CRM accounts..." 
            className="w-full pl-8 pr-12 py-1 bg-slate-50 border border-outline-variant rounded text-on-surface placeholder:text-secondary font-body-sm text-body-sm focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" 
          />
          <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-secondary bg-white border border-outline-variant rounded">Cmd+K</kbd>
          </span>
        </div>
      </div>


      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-outline-variant font-label-sm text-label-sm text-secondary">
          <span className="material-symbols-outlined" data-icon="schedule" style={{ fontSize: "14px" }}>schedule</span>
          <span>Today, {today}</span>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-label-sm text-label-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <span>{ROLE_LABELS[user.role] || user.role} (Enterprise)</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="relative p-1.5 text-secondary hover:text-on-surface hover:bg-slate-50 rounded transition-colors" title="Notifications">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
          </button>
          <button className="p-1.5 text-secondary hover:text-on-surface hover:bg-slate-50 rounded transition-colors" title="Workspace Display Tuning">
            <span className="material-symbols-outlined" data-icon="tune">tune</span>
          </button>
        </div>
        
        <div className="h-4 w-px bg-outline-variant mx-0.5"></div>
        
        <button className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white font-label-sm text-label-sm rounded flex items-center gap-1.5 transition-colors shadow-sm">
          <span className="material-symbols-outlined" data-icon="add" style={{ fontSize: "14px" }}>add</span>
          <span className="hidden sm:inline">Create Record</span>
        </button>
      </div>
    </header>
    </div>
  )
}

