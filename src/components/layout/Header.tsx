"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

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
  const [showNotif, setShowNotif] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  const [notifications, setNotifications] = useState([{ id: 1, title: 'Welcome to BuildOrbit!', desc: 'Your enterprise command center is ready.' }]);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowNotif(false);
        setShowCreate(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={headerRef} className="sticky top-4 z-20 w-full px-4 sm:px-6 lg:px-10 flex justify-center pointer-events-none transition-all duration-200 mb-6">
      <header
        id="app-header"
        className={cn(
          "pointer-events-auto h-14 bg-surface-container-lowest dark:bg-slate-950/80 backdrop-blur-md border border-outline-variant dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 rounded-full shadow-md w-full max-w-[1920px]",
          "transition-all duration-200 ease-in-out"
        )}
      >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuOpen}
          className="flex lg:hidden text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white"
        >
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
        
        <div className="hidden lg:flex items-center gap-2 text-secondary dark:text-slate-400 font-label-sm text-label-sm shrink-0">
          <span className="font-semibold text-on-surface dark:text-white">BuildOrbit</span>
          <span className="text-outline-variant">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">Command Center</span>
        </div>

        <div className="relative w-full max-w-sm hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-secondary dark:text-slate-400">
            <span className="material-symbols-outlined" data-icon="search" style={{ fontSize: "16px" }}>search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search employees, payroll records, CRM accounts..." 
            className="w-full pl-8 pr-12 py-1 bg-slate-50 dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded text-on-surface dark:text-white placeholder:text-secondary dark:text-slate-400 font-body-sm text-body-sm focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" 
          />
          <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-secondary dark:text-slate-400 bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded">Cmd+K</kbd>
          </span>
        </div>
      </div>


      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-outline-variant dark:border-slate-800 font-label-sm text-label-sm text-secondary dark:text-slate-400">
          <span className="material-symbols-outlined" data-icon="schedule" style={{ fontSize: "14px" }}>schedule</span>
          <span>Today, {today}</span>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-label-sm text-label-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <span>{ROLE_LABELS[user.role] || user.role} (Enterprise)</span>
        </div>

        <div className="flex items-center gap-1 relative">
          <button type="button" className="hidden md:flex items-center gap-1 px-2 py-1 mr-1 text-xs font-semibold text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white hover:bg-slate-50 dark:bg-slate-900 rounded transition-colors" title="Toggle Theme">
            <span className="material-symbols-outlined text-[16px]">light_mode</span>
            <span>Light</span>
          </button>

          <button type="button" onClick={() => setShowNotif(!showNotif)} className="relative p-1.5 text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white hover:bg-slate-50 dark:bg-slate-900 rounded transition-colors" title="Notifications">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>}
          </button>
          
          {showNotif && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-on-surface dark:text-white">Notifications</h4>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-secondary dark:text-slate-400 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-xs text-secondary dark:text-slate-400 mt-1">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
        
        <div className="h-4 w-px bg-outline-variant mx-0.5"></div>
        
        <div className="relative">
          <button type="button" onClick={() => setShowCreate(!showCreate)} className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white font-label-sm text-label-sm rounded flex items-center gap-1.5 transition-colors shadow-sm">
            <span className="material-symbols-outlined" data-icon="add" style={{ fontSize: "14px" }}>add</span>
            <span className="hidden sm:inline">Create Record</span>
          </button>

          {showCreate && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-lg p-2 z-50">
              <div className="px-3 py-2 text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Quick Create</div>
              <Link href="/workforce/leave/new" onClick={() => setShowCreate(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[18px]">event</span>
                Leave Request
              </Link>
              {user.role !== 'ENGINEER' && (
                <Link href="/workforce/employees/new" onClick={() => setShowCreate(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Employee
                </Link>
              )}
            </div>
          )}
        </div>
        <Link href="/profile" className="flex items-center gap-2 shrink-0" title={user.name || user.email}>
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border border-slate-300 dark:border-slate-600 shrink-0">
            {initials}
          </div>
        </Link>
      </div>
    </header>
    </div>
  )
}

