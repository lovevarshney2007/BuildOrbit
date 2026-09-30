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
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Total Payroll Cost</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Total Deductions / Taxes</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Processed Records</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">{recordCount}</h3>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
          <p className="text-[13px] font-medium text-[#64748B]">Avg Cost per Record</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1E293B]">
             ${recordCount ? (totalCost / recordCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </h3>
        </div>
      </div>

      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-[#1E293B]">Monthly Payroll Cost & Deductions</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
              <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" name="Total Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="deductions" name="Total Deductions" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
