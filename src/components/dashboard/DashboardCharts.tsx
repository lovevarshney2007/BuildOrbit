"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const businessData = [
  { month: "Jan", employeeTrend: 2, attendanceRate: 98 },
  { month: "Feb", employeeTrend: 4, attendanceRate: 95 },
  { month: "Mar", employeeTrend: 4, attendanceRate: 97 },
  { month: "Apr", employeeTrend: 5, attendanceRate: 99 },
  { month: "May", employeeTrend: 6, attendanceRate: 94 },
  { month: "Jun", employeeTrend: 7, attendanceRate: 96 },
]

const pipelineData = [
  { week: "Week 1", openLeads: 10, won: 2 },
  { week: "Week 2", openLeads: 15, won: 5 },
  { week: "Week 3", openLeads: 12, won: 6 },
  { week: "Week 4", openLeads: 18, won: 8 },
]

const COLORS = ["#10b981", "#f59e0b", "#f43f5e"] // Emerald, Amber, Rose (Generic UI colors)
const CHART_PRIMARY = "#0ea5e9" // Light Blue
const CHART_SECONDARY = "#64748b" // Slate

export function BusinessWorkforceChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={businessData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface-container, #ffffff)', borderColor: 'var(--color-outline-variant, #e2e8f0)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--color-on-surface, #0f172a)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="employeeTrend" name="Employee Count" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="attendanceRate" name="Attendance %" fill={CHART_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CRMLeadPipelineChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface-container, #ffffff)', borderColor: 'var(--color-outline-variant, #e2e8f0)', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="openLeads" name="Open Leads" stroke={CHART_PRIMARY} strokeWidth={3} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="won" name="Won Deals" stroke={COLORS[0]} strokeWidth={3} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AttendanceDonutChart({ 
  present, 
  onLeave, 
  absent 
}: { 
  present: number, 
  onLeave: number, 
  absent: number 
}) {
  const data = [
    { name: "Present", value: present || 1 }, // Fallback to 1 to show a circle if 0
    { name: "On Leave", value: onLeave },
    { name: "Absent", value: absent },
  ]
  const total = present + onLeave + absent

  return (
    <div className="h-[250px] w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface-container, #ffffff)', borderColor: 'var(--color-outline-variant, #e2e8f0)', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-on-surface dark:text-white">
          {total}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary dark:text-slate-400">Total</span>
      </div>
    </div>
  )
}
