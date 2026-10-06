import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OrgPolicyForm, HolidaysManager } from "./client"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) redirect("/dashboard")

  const policy = await prisma.organizationPolicy.findUnique({ where: { id: "default" } }) 
    || { timezone: "UTC", weeklyOffDays: [] };
    
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20">
      {/* Top Breadcrumb & Page Banner Header */}
      <section className="bg-surface-container-lowest dark:bg-slate-950 border-b border-outline-variant dark:border-slate-800 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-1">
              <span className="hover:text-on-surface dark:text-white cursor-pointer">Administration</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-on-surface dark:text-white font-semibold">Settings</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white font-bold tracking-tight">Organization &amp; Compliance Settings</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant dark:border-slate-800 bg-surface-bright">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">domain</span>
              General Policy
            </h2>
            <p className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1">Configure your organization identity and weekly off days.</p>
          </div>
          <div className="p-5">
            <OrgPolicyForm initialData={policy} />
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant dark:border-slate-800 bg-surface-bright">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event</span>
              Declared Holidays
            </h2>
            <p className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1">Manage public and company holidays. These days won't count against leave quotas.</p>
          </div>
          <div className="p-5">
            <HolidaysManager holidays={holidays} />
          </div>
        </div>
      </section>
    </div>
  )
}
