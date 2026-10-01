// Roles that can see a given nav item.
// An empty array means the item is visible to all roles.
export type AppRole = "SUPER_ADMIN" | "ADMIN" | "HR" | "LEAD" | "ENGINEER"

export interface NavItem {
  label: string
  href: string
  icon: string // Material Symbol string
  roles: AppRole[] // empty = all roles
}

export interface NavGroup {
  title: string
  items: NavItem[]
  roles?: AppRole[] // hide the entire group for certain roles
}

export const navConfig: NavGroup[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        roles: [],
      },
    ],
  },
  {
    title: "WORKFORCE",
    items: [
      {
        label: "Attendance",
        href: "/workforce/attendance",
        icon: "how_to_reg",
        roles: [],
      },
      {
        label: "Employees",
        href: "/workforce/employees",
        icon: "groups",
        roles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD"],
      },
      {
        label: "Leave Request",
        href: "/workforce/leave",
        icon: "event_busy",
        roles: [],
      },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        label: "Attendance Report",
        href: "/reports/attendance",
        icon: "analytics",
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Payroll Summary",
        href: "/reports/payroll",
        icon: "receipt_long",
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Lead Reports",
        href: "/reports/leads",
        icon: "query_stats",
        roles: ["SUPER_ADMIN", "ADMIN", "LEAD"],
      },
    ],
  },
  {
    title: "HR & PAYROLL",
    items: [
      {
        label: "Leave Master",
        href: "/hr/leave-types",
        icon: "assignment",
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Leave Approval",
        href: "/hr/leave-approval",
        icon: "rule",
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Payroll",
        href: "/hr/payroll",
        icon: "payments",
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        label: "Lead Follow-ups",
        href: "/crm/leads",
        icon: "leaderboard",
        roles: ["SUPER_ADMIN", "ADMIN", "LEAD"],
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Login Activity",
        href: "/admin/login-activity",
        icon: "admin_panel_settings",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
]

/**
 * Filter the nav config to only show items the user's role can see.
 */
export function getNavForRole(role: AppRole): NavGroup[] {
  return navConfig
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.roles.length === 0 || item.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

