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
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-[13px] font-medium text-secondary">Total Payroll Cost</p>
          <h3 className="mt-2 text-2xl font-bold text-on-surface">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-[13px] font-medium text-secondary">Total Deductions / Taxes</p>
          <h3 className="mt-2 text-2xl font-bold text-on-surface">${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-[13px] font-medium text-secondary">Processed Records</p>
          <h3 className="mt-2 text-2xl font-bold text-on-surface">{recordCount}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-[13px] font-medium text-secondary">Avg Cost per Record</p>
          <h3 className="mt-2 text-2xl font-bold text-on-surface">
             ${recordCount ? (totalCost / recordCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </h3>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-on-surface">Monthly Payroll Cost & Deductions</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
              <YAxis yAxisId="left" orientation="left" stroke="#334155" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fill: '#64748b'}} axisLine={{stroke: '#cbd5e1'}} />
              <RechartsTooltip formatter={(value: unknown) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" name="Total Cost" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="deductions" name="Total Deductions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
