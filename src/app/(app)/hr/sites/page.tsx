import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Users, Edit } from "lucide-react"
import { DeleteSiteButton } from "./delete-button"

export default async function SitesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          employeeAssignments: { where: { isActive: true } },
          teamAssignments: { where: { isActive: true } },
        }
      }
    }
  })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>HR & Admin</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">Sites & Geofencing</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Geofence Sites</h1>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Manage work locations and attendance geofences</p>
        </div>
        
        <Link href="/hr/sites/new" className="h-10 px-4 bg-primary text-on-primary rounded-xl font-label-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto self-start sm:self-auto">
          <MapPin size={18} />
          Add New Site
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {sites.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MapPin size={32} />
            </div>
            <h3 className="font-title-lg text-title-lg text-on-surface dark:text-white">No sites created yet</h3>
            <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-1 max-w-md">Create geographic sites to track attendance strictly within geofences.</p>
          </div>
        ) : (
          sites.map((site) => (
            <div key={site.id} className="bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-title-md text-on-surface dark:text-white font-semibold">{site.name}</h3>
                    {!site.isActive && (
                      <span className="px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                    )}
                  </div>
                  <p className="text-secondary dark:text-slate-400 font-label-sm text-sm mt-0.5">Code: {site.code}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/hr/sites/${site.id}`} className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit size={18} />
                  </Link>
                  <DeleteSiteButton id={site.id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-outline-variant/30 mt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-secondary dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Geofence Radius</span>
                  <span className="text-on-surface dark:text-white font-body-md">{site.radiusMeters} meters</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-secondary dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Coordinates</span>
                  <span className="text-on-surface dark:text-white font-body-md font-mono text-sm">{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-secondary dark:text-slate-400 text-sm">
                <div className="flex items-center gap-1.5" title="Active Employee Assignments">
                  <Users size={16} />
                  <span>{site._count.employeeAssignments} Employees</span>
                </div>
                <div className="flex items-center gap-1.5" title="Active Team Assignments">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>{site._count.teamAssignments} Teams</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
