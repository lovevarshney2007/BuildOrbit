import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  UserCircle,
  CalendarDays,
  DollarSign,
  FileText,
  BarChart2,
  Settings,
  Activity,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"

// Roles that can see a given nav item.
// An empty array means the item is visible to all roles.
export type AppRole = "SUPER_ADMIN" | "ADMIN" | "HR" | "LEAD" | "ENGINEER"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: AppRole[] // empty = all roles
}

export interface NavGroup {
  title: string
  items: NavItem[]
  roles?: AppRole[] // hide the entire group for certain roles
}

export const navConfig: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [],
      },
      {
        label: "My Profile",
        href: "/profile",
        icon: UserCircle,
        roles: [],
      },
    ],
  },
  {
    title: "Workforce",
    items: [
      {
        label: "Employees",
        href: "/workforce/employees",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN", "HR", "LEAD"],
      },
      {
        label: "Attendance",
        href: "/workforce/attendance",
        icon: CalendarDays,
        roles: [],
      },
      {
        label: "Leave Requests",
        href: "/workforce/leave",
        icon: FileText,
        roles: [],
      },
    ],
  },
  {
    title: "HR & Payroll",
    items: [
      {
        label: "Leave Master",
        href: "/hr/leave-types",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Leave Approval",
        href: "/hr/leave-approval",
        icon: UserCheck,
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Payroll",
        href: "/hr/payroll",
        icon: DollarSign,
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
        icon: Briefcase,
        roles: ["SUPER_ADMIN", "ADMIN", "LEAD"],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Attendance Report",
        href: "/reports/attendance",
        icon: BarChart2,
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Payroll Summary",
        href: "/reports/payroll",
        icon: DollarSign,
        roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      },
      {
        label: "Lead Reports",
        href: "/reports/leads",
        icon: BarChart2,
        roles: ["SUPER_ADMIN", "ADMIN", "LEAD"],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Login Activity",
        href: "/admin/login-activity",
        icon: Activity,
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
