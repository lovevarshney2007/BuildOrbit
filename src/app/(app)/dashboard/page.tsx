import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CalendarCheck,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
} from "lucide-react"
import { AttendanceStatus, LeaveStatus, PayrollStatus } from "@prisma/client"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"

// Helper: get date string for today at midnight UTC
function todayDate() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const today = todayDate()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  // --- Fetch stats based on role ---
  const [
    totalEmployees,
    presentToday,
    onLeaveToday,
    pendingLeaveRequests,
    pendingPayroll,
    recentLeaves,
    totalLeads,
    activeLeads,
    myAttendance,
    myLeaves,
  ] = await Promise.all([
    // Total employees (for admin/hr/lead roles)
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    // Present today
    prisma.attendance.count({ where: { date: today, status: AttendanceStatus.PRESENT } }),
    // On leave today
    prisma.attendance.count({ where: { date: today, status: AttendanceStatus.ON_LEAVE } }),
    // Pending leave requests
    prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
    // Payroll needing processing
    prisma.payroll.count({ where: { status: PayrollStatus.DRAFT, month: currentMonth, year: currentYear } }),
    // Recent leave requests (last 5)
    prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { name: true, email: true } },
        leaveType: { select: { name: true } },
      },
    }),
    // Leads
    prisma.lead.count(),
    prisma.lead.count({ where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION"] } } }),
    // My attendance (engineer)
    user.role === "ENGINEER" ? prisma.employee.findFirst({
      where: { userId: user.userId },
      include: {
        attendances: { where: { date: today }, take: 1 },
      },
    }) : null,
    // My leaves
    user.role === "ENGINEER" ? prisma.leaveRequest.count({
      where: { requesterId: user.userId, status: LeaveStatus.PENDING },
    }) : null,
  ])

  // Attendance trend — last 7 days
  const last7Days: { date: string; present: number; absent: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    const [p, a] = await Promise.all([
      prisma.attendance.count({ where: { date: d, status: AttendanceStatus.PRESENT } }),
      prisma.attendance.count({ where: { date: d, status: AttendanceStatus.ABSENT } }),
    ])
    last7Days.push({ date: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`, present: p, absent: a })
  }

  const isAdminLike = ["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)
  const isLead = user.role === "LEAD"
  const isEngineer = user.role === "ENGINEER"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name || user.email}. Here's your workspace overview.`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isAdminLike && (
          <>
            <KpiCard
              label="Total Employees"
              value={totalEmployees}
              icon={<Users className="size-4 text-blue-600" />}
              bg="bg-blue-50"
            />
            <KpiCard
              label="Present Today"
              value={presentToday}
              icon={<CalendarCheck className="size-4 text-green-600" />}
              bg="bg-green-50"
            />
            <KpiCard
              label="On Leave Today"
              value={onLeaveToday}
              icon={<Clock className="size-4 text-amber-600" />}
              bg="bg-amber-50"
            />
            <KpiCard
              label="Pending Leave Requests"
              value={pendingLeaveRequests}
              icon={<AlertCircle className="size-4 text-red-500" />}
              bg="bg-red-50"
            />
          </>
        )}
        {isAdminLike && (
          <KpiCard
            label="Pending Payroll"
            value={pendingPayroll}
            icon={<DollarSign className="size-4 text-purple-600" />}
            bg="bg-purple-50"
            className="col-span-2 lg:col-span-1"
          />
        )}
        {(isAdminLike || isLead) && (
          <>
            <KpiCard
              label="Total Leads"
              value={totalLeads}
              icon={<Briefcase className="size-4 text-indigo-600" />}
              bg="bg-indigo-50"
              className={isAdminLike ? "col-span-2 lg:col-span-1" : ""}
            />
            <KpiCard
              label="Active Leads"
              value={activeLeads}
              icon={<TrendingUp className="size-4 text-cyan-600" />}
              bg="bg-cyan-50"
              className={isAdminLike ? "col-span-2 lg:col-span-1" : ""}
            />
          </>
        )}
        {isEngineer && (
          <>
            <KpiCard
              label="Today's Status"
              value={myAttendance?.attendances?.[0]?.status ?? "Not Marked"}
              icon={<CalendarCheck className="size-4 text-green-600" />}
              bg="bg-green-50"
            />
            <KpiCard
              label="Pending Leaves"
              value={myLeaves ?? 0}
              icon={<FileText className="size-4 text-amber-600" />}
              bg="bg-amber-50"
            />
          </>
        )}
      </div>

      {/* Charts (admin/hr) + Leave requests */}
      <div className="grid gap-4 lg:grid-cols-3">
        {isAdminLike && last7Days.length > 0 && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend — Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardCharts data={last7Days} />
              </CardContent>
            </Card>
          </div>
        )}

        {(isAdminLike || isLead) && (
          <Card className={isAdminLike ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentLeaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <CheckCircle className="size-8 text-slate-300" />
                  <p className="text-[13px] text-[#64748B]">No leave requests</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {recentLeaves.map((req) => (
                    <div key={req.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[#1E293B]">
                          {req.requester.name || req.requester.email}
                        </p>
                        <p className="text-[12px] text-[#64748B]">{req.leaveType.name} · {req.days} day{req.days !== 1 ? "s" : ""}</p>
                      </div>
                      <LeaveStatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon,
  bg,
  className,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  bg: string
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] text-[#64748B]">{label}</p>
          <p className="text-[20px] font-semibold text-[#1E293B]">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LeaveStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    APPROVED: { variant: "success", label: "Approved" },
    REJECTED: { variant: "error", label: "Rejected" },
    CANCELLED: { variant: "default" as "success", label: "Cancelled" },
  }
  const config = map[status] ?? { variant: "default" as "success", label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
