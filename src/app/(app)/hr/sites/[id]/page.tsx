import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SiteForm } from "../client-form"
import { SiteAssignments } from "./assignments"

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      employeeAssignments: {
        where: { isActive: true },
        include: { employee: { include: { user: true } } },
        orderBy: { effectiveFrom: "desc" }
      },
      teamAssignments: {
        where: { isActive: true },
        include: { team: true },
        orderBy: { effectiveFrom: "desc" }
      }
    }
  })

  const [allEmployees, allTeams] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    }),
    prisma.team.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })
  ])

  const employeesProp = allEmployees.map(e => ({ id: e.id, name: e.user?.name || e.employeeCode }))
  const teamsProp = allTeams.map(t => ({ id: t.id, name: t.name }))

  const empAssigns = site?.employeeAssignments.map(a => ({
    id: a.id,
    name: a.employee.user?.name || a.employee.employeeCode,
    effectiveFrom: a.effectiveFrom.toISOString().slice(0,10),
    effectiveUntil: a.effectiveUntil ? a.effectiveUntil.toISOString().slice(0,10) : null,
    isActive: a.isActive
  })) || []

  const teamAssigns = site?.teamAssignments.map(a => ({
    id: a.id,
    name: a.team.name,
    effectiveFrom: a.effectiveFrom.toISOString().slice(0,10),
    effectiveUntil: a.effectiveUntil ? a.effectiveUntil.toISOString().slice(0,10) : null,
    isActive: a.isActive
  })) || []

  if (!site) redirect("/hr/sites")

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-2">
            <Link href="/hr/sites" className="hover:text-primary transition-colors">Sites & Geofencing</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">Edit Site</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Edit Site: {site.name}</h1>
        </div>
      </div>

      <div className="w-full">
        <SiteForm 
          id={site.id} 
          initialData={{
            name: site.name,
            code: site.code,
            address: site.address ?? "",
            latitude: site.latitude,
            longitude: site.longitude,
            radiusMeters: site.radiusMeters,
            isActive: site.isActive,
            projectName: site.projectName ?? "",
            region: site.region ?? "",
          }} 
        />
      </div>

      <SiteAssignments 
        siteId={site.id}
        employees={employeesProp}
        teams={teamsProp}
        employeeAssignments={empAssigns}
        teamAssignments={teamAssigns}
      />
    </div>
  )
}
