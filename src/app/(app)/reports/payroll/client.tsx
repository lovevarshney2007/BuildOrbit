"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"

interface ChartData {
  name: string
  cost: number
  deductions: number
}

interface PayrollAnalyticsClientProps {
  trendData: ChartData[]
  totalCost: number
  totalDeductions: number
  recordCount: number
}

export function PayrollAnalyticsClient({ trendData, totalCost, totalDeductions, recordCount }: PayrollAnalyticsClientProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Total Payroll Cost</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Total Deductions / Taxes</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Processed Records</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">{recordCount}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-label-md text-label-md text-secondary">Avg Cost per Record</p>
          <h3 className="mt-3 font-metric-num text-metric-num text-on-surface">
             ${recordCount ? (totalCost / recordCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </h3>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-secondary text-[20px]">bar_chart</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Monthly Payroll Cost & Deductions</h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c3c6d7" />
              <XAxis dataKey="name" tick={{fill: '#545f73', fontSize: 12, fontFamily: 'Inter'}} axisLine={{stroke: '#c3c6d7'}} />
              <YAxis yAxisId="left" orientation="left" stroke="#0b1c30" tick={{fill: '#545f73', fontSize: 12, fontFamily: 'Inter'}} axisLine={{stroke: '#c3c6d7'}} />
              <YAxis yAxisId="right" orientation="right" stroke="#737686" tick={{fill: '#545f73', fontSize: 12, fontFamily: 'Inter'}} axisLine={{stroke: '#c3c6d7'}} />
              <RechartsTooltip formatter={(value: unknown) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} contentStyle={{borderRadius: '8px', border: '1px solid #c3c6d7', fontFamily: 'Inter', fontSize: '13px'}} />
              <Legend wrapperStyle={{fontFamily: 'Inter', fontSize: '12px'}} />
              <Bar yAxisId="left" dataKey="cost" name="Total Cost" fill="#004ac6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="deductions" name="Total Deductions" fill="#b4c5ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
