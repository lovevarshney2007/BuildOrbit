import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SiteForm } from "../client-form"

export default async function NewSitePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-2">
            <Link href="/hr/sites" className="hover:text-primary transition-colors">Sites & Geofencing</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">Add New Site</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Add New Site</h1>
        </div>
      </div>

      <SiteForm />
    </main>
  )
}
