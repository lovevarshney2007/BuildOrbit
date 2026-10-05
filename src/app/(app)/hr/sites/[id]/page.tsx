import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SiteForm } from "../client-form"

export default async function EditSitePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const site = await prisma.site.findUnique({
    where: { id: params.id }
  })

  if (!site) redirect("/hr/sites")

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
        
        {/* We can add a simple Leaflet/Google Maps iframe here for visualization */}
        <div className="bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 sticky top-6">
          <h3 className="font-title-lg text-title-lg text-on-surface dark:text-white">Geofence Preview</h3>
          <p className="text-sm text-secondary dark:text-slate-400">Employees must be within {site.radiusMeters}m of this point.</p>
          <div className="w-full h-[400px] bg-surface-variant rounded-xl overflow-hidden relative">
            {/* Simple static map image or iframe */}
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={`https://maps.google.com/maps?q=${site.latitude},${site.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
            />
            {/* Overlay circle (approximate) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/20 pointer-events-none" 
                 style={{ width: Math.max(50, site.radiusMeters), height: Math.max(50, site.radiusMeters) }}>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
