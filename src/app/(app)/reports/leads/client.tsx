"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

interface ChartData {
  name: string
  value: number
}

interface LeadAnalyticsClientProps {
  statusData: ChartData[]
  sourceData: ChartData[]
  totalLeads: number
  totalValue: number
}

export function LeadAnalyticsClient({ statusData, sourceData, totalLeads, totalValue }: LeadAnalyticsClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Total Leads</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">{totalLeads}</h3>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Pipeline Value</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">${totalValue.toLocaleString()}</h3>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Conversion Rate</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">
             {totalLeads ? Math.round((statusData.find(s => s.name === "WON")?.value || 0) / totalLeads * 100) : 0}%
          </h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-[#1E293B]">Sales Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-[#1E293B]">Lead Sources</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
