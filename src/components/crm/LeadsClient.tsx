"use client"

import { useState } from "react"
import { createLead } from "@/lib/actions/crm"
import { LeadSource, LeadStatus } from "@prisma/client"
import Link from "next/link"

type LeadType = {
  id: string
  title: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  company: string | null
  source: string
  status: string
  value: number | null
  assignedTo: { name: string | null; email: string } | null
  expectedClose: string | null
  createdAt: string
}

type UserType = {
  id: string
  name: string | null
}

const SOURCES: LeadSource[] = ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "EMAIL", "COLD_CALL", "EVENT", "OTHER"]
const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED", "LOST"]

export function LeadsClient({ leads, users }: { leads: LeadType[], users: UserType[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [filterAssigned, setFilterAssigned] = useState<string>("ALL")

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== "ALL" && lead.status !== filterStatus) return false
    if (filterAssigned !== "ALL" && (lead.assignedTo?.name || "UNASSIGNED") !== filterAssigned) {
      if (filterAssigned === "UNASSIGNED" && lead.assignedTo === null) return true
      if (filterAssigned !== lead.assignedTo?.name) return false
    }
    return true
  })

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val)) : "—"

  const formatDate = (dt: string | Date | null) =>
    dt ? new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createLead(formData)
      setIsModalOpen(false)
      // reset not needed because modal unmounts
    } catch (error: any) {
      alert(error.message || "Failed to create lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const uniqueAssignees = Array.from(new Set(leads.map(l => l.assignedTo?.name).filter(Boolean))) as string[]

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* HEADER / FILTERS */}
      <div className="p-6 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-on-surface dark:text-white">All Leads</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-label-md text-label-md px-4 h-9 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Lead</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between bg-surface-container-lowest dark:bg-slate-950 p-3 rounded-xl border border-outline-variant dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-sm">filter_alt</span>
            <span className="text-sm font-medium text-secondary">Filters:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm bg-transparent border border-outline-variant dark:border-slate-800 rounded px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer text-on-surface dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <select 
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              className="text-sm bg-transparent border border-outline-variant dark:border-slate-800 rounded px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer text-on-surface dark:text-white"
            >
              <option value="ALL">All Leads</option>
              {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
          
          <div className="text-sm text-secondary dark:text-slate-400">
            {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        {filteredLeads.length === 0 ? (
          <div className="border border-dashed border-outline-variant dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-950 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface dark:text-white mb-1">No leads found</h3>
            <p className="text-secondary dark:text-slate-400 text-sm">No leads match your current filters. Try adjusting the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map(lead => (
              <Link key={lead.id} href={`/crm/leads/${lead.id}`} className="block bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col h-full group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-on-surface dark:text-white leading-tight group-hover:text-primary transition-colors">{lead.title}</h3>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-1">{lead.company || "Unknown Company"}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold tracking-wider">{lead.status}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-outline-variant dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary dark:text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">payments</span> Value
                    </span>
                    <span className="font-semibold text-primary">{formatCurrency(lead.value)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary dark:text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span> Assigned
                    </span>
                    <span className="text-on-surface dark:text-white font-medium">{lead.assignedTo?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary dark:text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">event</span> Close Date
                    </span>
                    <span className="text-on-surface dark:text-white font-medium">{formatDate(lead.expectedClose)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CREATE LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface dark:text-white">Add New Lead</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-secondary hover:text-on-surface dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Name *</label>
                <input 
                  required 
                  name="title" 
                  placeholder="Lead name" 
                  className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white placeholder:text-secondary/50" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Email</label>
                  <input 
                    type="email"
                    name="email" 
                    placeholder="email@example.com" 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white placeholder:text-secondary/50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Phone</label>
                  <input 
                    name="phone" 
                    placeholder="+91 98765 43210" 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white placeholder:text-secondary/50" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Company</label>
                  <input 
                    name="company" 
                    placeholder="Company name" 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white placeholder:text-secondary/50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Source</label>
                  <select 
                    name="source" 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white"
                  >
                    <option value="" disabled selected>Select source</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Priority</label>
                  <select 
                    name="priority" 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white"
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Estimated Value</label>
                  <input 
                    type="number"
                    name="value" 
                    defaultValue={0} 
                    className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-white mb-1">Assign To</label>
                <select 
                  name="assignedToId" 
                  className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary text-on-surface dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4 pt-4 border-t border-outline-variant dark:border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg font-medium bg-primary hover:bg-primary-dark text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
