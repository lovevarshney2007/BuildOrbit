"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Orbit,
  LogOut,
} from "lucide-react"
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
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1E293B] text-white",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-16" : "w-60",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        {/* Branding */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-white/10",
            collapsed ? "justify-center px-0" : "gap-2.5 px-4",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500">
            <Orbit className="size-4 text-white" aria-hidden="true" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-white">
              BuildOrbit
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Sidebar navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3"
        >
          {filteredNav.map((group: NavGroup) => (
            <NavGroupSection
              key={group.title}
              group={group}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* User / logout */}
        <div className="shrink-0 border-t border-white/10 px-2 py-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2",
              collapsed && "justify-center",
            )}
          >
            {/* Avatar */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">
                  {user.name || user.email}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            )}
            {!collapsed && (
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Log out"
                  title="Log out"
                  className="ml-auto rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
          {/* Logout when collapsed */}
          {collapsed && (
            <form action={logoutAction} className="mt-1 flex justify-center">
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          id="sidebar-collapse-toggle"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "absolute -right-3 top-[52px] z-10 hidden h-6 w-6 items-center justify-center",
            "rounded-full border border-[#E2E8F0] bg-white text-slate-500",
            "shadow-sm hover:bg-slate-50 hover:text-slate-700 lg:flex",
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </aside>
    </>
  )
}

function NavGroupSection({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
}) {
  return (
    <div className="mb-1">
      {!collapsed && (
        <p className="mb-0.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {group.title}
        </p>
      )}
      {collapsed && (
        <div className="mx-auto mb-1 mt-2 h-px w-8 bg-white/10" />
      )}
      <ul role="list" className="space-y-0.5">
        {group.items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2 py-1.5",
                  "text-[13px] font-medium transition-colors duration-100",
                  isActive
                    ? "bg-white/10 text-white before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-r before:bg-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  collapsed && "justify-center",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-200",
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
