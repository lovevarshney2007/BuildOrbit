import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  CalendarDays,
  DollarSign,
  FileText,
  BarChart2,
  Settings,
  Building2,
  type LucideIcon,
} from "lucide-react"

// Roles that can see a given nav item.
// An empty array means the item is visible to all roles.
// When auth is implemented, filter navConfig by the current user's role.
export type AppRole = "super_admin" | "admin" | "hr" | "lead" | "employee"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: AppRole[] // empty = all roles
}

export interface NavGroup {
  title: string
  items: NavItem[]
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
    ],
  },
  {
    title: "Workforce",
    items: [
      {
        label: "Employees",
        href: "/workforce/employees",
        icon: Users,
        roles: ["super_admin", "admin", "hr", "lead"],
      },
      {
        label: "Departments",
        href: "/workforce/departments",
        icon: Building2,
        roles: ["super_admin", "admin", "hr"],
      },
      {
        label: "Roles & Access",
        href: "/workforce/roles",
        icon: UserCheck,
        roles: ["super_admin", "admin"],
      },
    ],
  },
  {
    title: "HR",
    items: [
      {
        label: "Attendance",
        href: "/hr/attendance",
        icon: CalendarDays,
        roles: ["super_admin", "admin", "hr", "lead"],
      },
      {
        label: "Leave",
        href: "/hr/leave",
        icon: FileText,
        roles: [],
      },
      {
        label: "Payroll",
        href: "/hr/payroll",
        icon: DollarSign,
        roles: ["super_admin", "admin", "hr"],
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        label: "Clients",
        href: "/crm/clients",
        icon: Briefcase,
        roles: ["super_admin", "admin", "lead"],
      },
      {
        label: "Projects",
        href: "/crm/projects",
        icon: Building2,
        roles: ["super_admin", "admin", "hr", "lead"],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Analytics",
        href: "/reports/analytics",
        icon: BarChart2,
        roles: ["super_admin", "admin", "hr"],
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
        roles: ["super_admin", "admin"],
      },
    ],
  },
]
