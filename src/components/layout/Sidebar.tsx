"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getNavForRole, type NavGroup, type AppRole } from "@/lib/navigation"
import type { SessionPayload } from "@/lib/session"
import { logoutAction } from "@/lib/actions/auth"

interface SidebarProps {
  user: SessionPayload
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

// Role display label
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  HR: "HR",
  LEAD: "Lead",
  ENGINEER: "Engineer",
}

export function Sidebar({
  user,
  mobileOpen = false,
  onMobileClose,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname()
  const filteredNav = getNavForRole(user.role as AppRole)

  // Get initials from name or email
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 h-screen z-40 bg-surface-container-lowest/90 backdrop-blur-md border-r border-outline-variant flex flex-col justify-between p-3 select-none",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-16" : "w-60",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        {/* Top Brand & Suite Identifier */}
        <div className="space-y-4 flex flex-col flex-1 min-h-0">
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 shrink-0 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-slate-900" data-icon="orbit">orbit</span>
            {!collapsed && (
              <span className="font-bold text-on-surface">BuildOrbit</span>
            )}
          </Link>
          {!collapsed && (
            <div className="px-2 pb-1 border-b border-outline-variant flex items-center justify-between shrink-0">
              <span className="font-label-sm text-label-sm text-secondary">Enterprise Suite</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-label-sm text-label-sm text-slate-700 font-medium">v4.8</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1 custom-scrollbar">
            {filteredNav.map((group: NavGroup, groupIndex: number) => (
              <NavGroupSection
                key={group.title}
                group={group}
                collapsed={collapsed}
                pathname={pathname}
                baseIndex={groupIndex * 5}
              />
            ))}
          </nav>
        </div>

        {/* Quick Action Launcher & Footer Navigation Links */}
        <div className="space-y-3 pt-2 border-t border-outline-variant">
          {!collapsed && (
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-label-md text-label-md h-8 rounded px-3 flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined" data-icon="add" style={{ fontSize: "16px" }}>add</span>
              <span>Quick Action</span>
            </button>
          )}
          
          <div className="space-y-1">
            {/* Collapse Sidebar */}
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-secondary hover:text-on-surface hover:bg-slate-50 rounded font-label-sm text-label-sm transition-colors text-left"
            >
              <span className="material-symbols-outlined" data-icon={collapsed ? "menu" : "menu_open"}>{collapsed ? "menu" : "menu_open"}</span>
              {!collapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>

          {/* User Session Snippet */}
          <div className={cn("rounded bg-slate-50 border border-outline-variant flex items-center", collapsed ? "p-1 justify-center" : "p-2 gap-2.5")}>
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-label-md text-label-md font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="overflow-hidden leading-tight flex-1">
                  <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold">{user.name || user.email}</p>
                  <p className="font-label-sm text-label-sm text-secondary truncate">{ROLE_LABELS[user.role] || user.role}</p>
                </div>
                <form action={logoutAction}>
                  <button type="submit" className="text-secondary hover:text-on-surface p-1 flex items-center justify-center" title="Log out">
                    <span className="material-symbols-outlined" data-icon="logout" style={{ fontSize: "16px" }}>logout</span>
                  </button>
                </form>
              </>
            )}
            {collapsed && (
              <form action={logoutAction} className="mt-1">
                <button type="submit" className="text-secondary hover:text-on-surface p-1 flex items-center justify-center" title="Log out">
                  <span className="material-symbols-outlined" data-icon="logout" style={{ fontSize: "16px" }}>logout</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function NavGroupSection({
  group,
  collapsed,
  pathname,
  baseIndex = 0,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
  baseIndex?: number
}) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="mb-1 px-3 py-1 font-label-sm text-label-sm text-secondary uppercase tracking-widest">
          {group.title}
        </p>
      )}
      {collapsed && (
        <div className="mx-auto mb-1 mt-2 h-px w-8 bg-outline-variant" />
      )}
      <ul role="list" className="space-y-1">
        {group.items.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.li 
              key={item.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (baseIndex + index) * 0.05 }}
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded transition-colors duration-150 ease-in-out cursor-pointer",
                  isActive
                    ? "text-slate-900 bg-slate-100 font-label-md text-label-md border-l-2 border-slate-900 font-semibold"
                    : "text-secondary hover:text-on-surface hover:bg-slate-50 font-label-md text-label-md",
                  collapsed && "justify-center px-0 border-l-0"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined",
                    isActive ? "text-slate-900" : ""
                  )}
                  data-icon={item.icon}
                >
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
