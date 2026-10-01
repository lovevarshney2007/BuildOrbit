"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"

const COLORS = ['#004ac6', '#2563eb', '#586377', '#b4c5ff', '#00174b', '#dbe1ff'];

interface ChartData {
  name: string
  value: number
}

interface OverdueFollowUp {
  id: string
  leadName: string
  leadCompany: string | null
  date: Date
  notes: string
}

interface LeadAnalyticsClientProps {
  statusData: ChartData[]
  sourceData: ChartData[]
  activityData: ChartData[]
  totalLeads: number
  convertedCount: number
  overdueCount: number
  wonValue: number
  overdueList: OverdueFollowUp[]
}

export function LeadAnalyticsClient({ statusData, sourceData, activityData, totalLeads, convertedCount, overdueCount, wonValue, overdueList }: LeadAnalyticsClientProps) {
  
  const conversionRate = totalLeads ? Math.round((convertedCount / totalLeads) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 4 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL LEADS */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-secondary dark:text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2">Total Leads</p>
              <h3 className="font-metric-num text-3xl font-bold text-on-surface dark:text-white">{totalLeads}</h3>
            </div>
            <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">groups</span>
            </div>
          </div>
        </div>

        {/* CONVERTED */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-secondary dark:text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2">Converted</p>
              <h3 className="font-metric-num text-3xl font-bold text-on-surface dark:text-white">{convertedCount}</h3>
              <p className="text-xs text-secondary dark:text-slate-400 mt-2">{conversionRate}% rate</p>
            </div>
            <div className="w-10 h-10 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">arrow_outward</span>
            </div>
          </div>
        </div>

        {/* OVERDUE */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-secondary dark:text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2">Overdue</p>
              <h3 className="font-metric-num text-3xl font-bold text-red-600 dark:text-red-400">{overdueCount}</h3>
              <p className="text-xs text-secondary dark:text-slate-400 mt-2">Need attention</p>
            </div>
            <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
            </div>
          </div>
        </div>

        {/* PIPELINE VALUE */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-secondary dark:text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2">Pipeline Value</p>
              <h3 className="font-metric-num text-3xl font-bold text-on-surface dark:text-white">₹{wonValue.toLocaleString()}</h3>
              <p className="text-xs text-secondary dark:text-slate-400 mt-2">Won value</p>
            </div>
            <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">currency_rupee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Row 1 (2 charts) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Follow-up Activity (Line) */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white">Follow-up Activity</h3>
          </div>
          <p className="text-xs text-secondary dark:text-slate-400 mb-6">Daily follow-ups completed</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px'}} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Pipeline (Bar) */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">stacked_bar_chart</span>
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white">Lead Pipeline</h3>
          </div>
          <p className="text-xs text-secondary dark:text-slate-400 mb-6">Current lead status distribution</p>
          {statusData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-sm text-secondary dark:text-slate-500">
              No leads yet
            </div>
          )}
        </div>
      </div>

      {/* Row 2 (2 charts) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Source Analysis */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-purple-500 text-[20px]">pie_chart</span>
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white">Lead Source Analysis</h3>
          </div>
          <p className="text-xs text-secondary dark:text-slate-400 mb-6">Where your leads come from</p>
          {sourceData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-sm text-secondary dark:text-slate-500">
              No source data
            </div>
          )}
        </div>

        {/* Follow-up Type Breakdown */}
        <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">filter_alt</span>
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white">Follow-up Type Breakdown</h3>
          </div>
          <p className="text-xs text-secondary dark:text-slate-400 mb-6">How you follow up</p>
          <div className="h-[250px] w-full flex items-center justify-center text-sm text-secondary dark:text-slate-500">
            No follow-up type data
          </div>
        </div>
      </div>

      {/* Row 3 (1 full width section) */}
      <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
          <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white">Overdue Follow-ups</h3>
        </div>
        <p className="text-xs text-secondary dark:text-slate-400 mb-6">Leads with missed follow-up dates</p>
        
        {overdueList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-secondary dark:text-slate-400 border-b border-outline-variant dark:border-slate-800">
                <tr>
                  <th className="pb-3 font-medium">LEAD</th>
                  <th className="pb-3 font-medium">COMPANY</th>
                  <th className="pb-3 font-medium">DUE DATE</th>
                  <th className="pb-3 font-medium">NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-slate-800">
                {overdueList.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container dark:hover:bg-slate-800/50">
                    <td className="py-3 text-on-surface dark:text-white font-medium">{item.leadName}</td>
                    <td className="py-3 text-secondary dark:text-slate-400">{item.leadCompany || '—'}</td>
                    <td className="py-3 text-red-600 dark:text-red-400">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 text-secondary dark:text-slate-400 truncate max-w-xs">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-secondary dark:text-slate-500">
            <span className="material-symbols-outlined text-3xl text-emerald-500/50">check_circle</span>
            <p className="text-sm">No overdue follow-ups. You&apos;re all caught up!</p>
          </div>
        )}
      </div>

    </div>
  )
}

export function DateFilterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const range = searchParams.get('range') || '30'
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val: string) => {
    setIsOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    if (val === '30') params.delete('range') // default
    else params.set('range', val)
    router.push(`?${params.toString()}`)
  }

  const getLabel = (val: string) => {
    switch (val) {
      case '7': return 'Last 7 days'
      case '30': return 'Last 30 days'
      case '90': return 'Last 90 days'
      case 'all': return 'All time'
      default: return 'Last 30 days'
    }
  }

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface-container dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-on-surface dark:text-white cursor-pointer hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-secondary">filter_list</span>
        <span>{getLabel(range)}</span>
        <span className="material-symbols-outlined text-[18px] text-secondary">expand_more</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          {[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: 'all', label: 'All time' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-container dark:hover:bg-slate-800 transition-colors ${range === option.value ? 'text-primary font-medium bg-primary/5 dark:bg-primary/10' : 'text-on-surface dark:text-white'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
