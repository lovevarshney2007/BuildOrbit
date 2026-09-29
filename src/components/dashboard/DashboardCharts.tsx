"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ChartData {
  date: string
  present: number
  absent: number
}

export function DashboardCharts({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="absent" name="Absent" fill="#FCA5A5" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
