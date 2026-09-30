"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ['#004ac6', '#2563eb', '#586377', '#b4c5ff', '#00174b', '#dbe1ff'];

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
    <div className="flex flex-col gap-6 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Total Leads</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">{totalLeads}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Pipeline Value</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">${totalValue.toLocaleString()}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Conversion Rate</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">
             {totalLeads ? Math.round((statusData.find(s => s.name === "WON")?.value || 0) / totalLeads * 100) : 0}%
          </h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary text-[20px]">filter_alt</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Sales Funnel</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#c3c6d7" />
                <XAxis type="number" tick={{fill: '#545f73', fontSize: 12, fontFamily: 'Inter'}} axisLine={{stroke: '#c3c6d7'}} />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#545f73', fontSize: 12, fontFamily: 'Inter'}} axisLine={{stroke: '#c3c6d7'}} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #c3c6d7', fontFamily: 'Inter', fontSize: '13px'}} />
                <Bar dataKey="value" fill="#004ac6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary text-[20px]">donut_small</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Lead Sources</h3>
          </div>
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
                  style={{fontFamily: 'Inter', fontSize: '12px', fill: '#545f73'}}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #c3c6d7', fontFamily: 'Inter', fontSize: '13px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
