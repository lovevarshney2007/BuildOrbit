"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSiteAction, updateSiteAction, assignEmployeeSiteAction, assignTeamSiteAction } from "@/lib/actions/site"
import { LocationPicker } from "@/components/ui/LocationPicker"

type SiteFormData = {
  name: string
  code: string
  address: string
  latitude: number | ""
  longitude: number | ""
  radiusMeters: number | ""
  isActive: boolean
  projectName: string
  region: string
}

export function SiteForm({ 
  initialData, 
  id,
  employees,
  teams
}: { 
  initialData?: Partial<SiteFormData> & { id?: string },
  id?: string
  employees?: { id: string; name: string }[]
  teams?: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const [formData, setFormData] = useState<SiteFormData>({
    name: initialData?.name ?? "",
    code: initialData?.code ?? "",
    address: initialData?.address ?? "",
    latitude: initialData?.latitude ?? "",
    longitude: initialData?.longitude ?? "",
    radiusMeters: initialData?.radiusMeters ?? 100,
    isActive: initialData?.isActive ?? true,
    projectName: initialData?.projectName ?? "",
    region: initialData?.region ?? "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? "" : Number(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      let siteId = id
      if (!siteId) {
        const result = await createSiteAction(formData)
        if (!result.success || !result.site) {
          setError(result.message || "Failed to create site")
          setIsSubmitting(false)
          return
        }
        siteId = result.site.id
      } else {
        const result = await updateSiteAction(siteId, formData)
        if (!result.success) {
          setError(result.message || "Failed to update site")
          setIsSubmitting(false)
          return
        }
      }

      // Create assignments if new site and there are selections
      if (!id && siteId && (selectedEmployees.length > 0 || selectedTeams.length > 0)) {
        const promises = []
        const effectiveFrom = new Date().toISOString().slice(0, 10)
        
        for (const empId of selectedEmployees) {
          promises.push(assignEmployeeSiteAction({
            siteId: siteId,
            targetId: empId,
            effectiveFrom: effectiveFrom,
            effectiveUntil: null
          }))
        }

        for (const teamId of selectedTeams) {
          promises.push(assignTeamSiteAction({
            siteId: siteId,
            targetId: teamId,
            effectiveFrom: effectiveFrom,
            effectiveUntil: null
          }))
        }

        await Promise.all(promises)
      }

      alert(id ? "Site updated successfully!" : "Site created successfully!")
      router.push("/hr/sites")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-6 w-full">
      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl font-body-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Site Name *</label>
          <input 
            type="text" 
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
            placeholder="e.g. DLF Cyber City Phase 2"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Site Code *</label>
          <input 
            type="text" 
            name="code"
            required
            pattern="[A-Z0-9_-]{2,30}"
            title="2-30 uppercase letters, numbers, hyphens or underscores"
            value={formData.code}
            onChange={handleChange}
            disabled={!!id}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary disabled:opacity-50" 
            placeholder="e.g. BLR-HQ"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-medium text-on-surface dark:text-white">Pin Location on Map</label>
          <p className="text-xs text-secondary dark:text-slate-400 mb-2">Search for a location, use your current location, or click anywhere on the map to set the exact coordinates.</p>
          <LocationPicker 
            latitude={formData.latitude} 
            longitude={formData.longitude} 
            radiusMeters={formData.radiusMeters}
            onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Latitude *</label>
          <input 
            type="number" 
            step="any"
            name="latitude"
            required
            min="-90" max="90"
            value={formData.latitude}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
            placeholder="e.g. 28.4900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Longitude *</label>
          <input 
            type="number" 
            step="any"
            name="longitude"
            required
            min="-180" max="180"
            value={formData.longitude}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
            placeholder="e.g. 77.0886"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-medium text-on-surface dark:text-white">Geofence Radius (meters) *</label>
          <input 
            type="number" 
            name="radiusMeters"
            required
            min="10" max="5000"
            value={formData.radiusMeters}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
          />
          <p className="text-xs text-secondary dark:text-slate-400">Employees must be within this many meters of the coordinates to clock in.</p>
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-medium text-on-surface dark:text-white">Address</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="p-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary resize-none" 
            placeholder="Full site address"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Project Name</label>
          <input 
            type="text" 
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface dark:text-white">Region</label>
          <input 
            type="text" 
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary" 
          />
        </div>

        <div className="flex items-center gap-3 pt-2 md:col-span-2">
          <input 
            type="checkbox" 
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 accent-primary" 
          />
          <label htmlFor="isActive" className="text-sm font-medium text-on-surface dark:text-white cursor-pointer">
            Site is active (can be assigned to employees)
          </label>
        </div>
      </div>

      {!id && (
        <div className="flex flex-col gap-6 pt-6 border-t border-outline-variant/30">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-title-md text-on-surface dark:text-white font-semibold">Initial Assignments (Optional)</h3>
            <p className="text-sm text-secondary dark:text-slate-400">Assign employees or teams to this site immediately upon creation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface dark:text-white">Assign Employees</label>
              <div className="h-48 overflow-y-auto border border-outline-variant/50 rounded-lg p-2 bg-background dark:bg-background-dark">
                {employees?.map(emp => (
                  <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-surface-variant rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedEmployees(prev => [...prev, emp.id])
                        else setSelectedEmployees(prev => prev.filter(id => id !== emp.id))
                      }}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                    <span className="text-sm text-on-surface dark:text-white truncate">{emp.name}</span>
                  </label>
                ))}
                {!employees?.length && <p className="text-sm text-secondary p-2">No employees available.</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface dark:text-white">Assign Teams</label>
              <div className="h-48 overflow-y-auto border border-outline-variant/50 rounded-lg p-2 bg-background dark:bg-background-dark">
                {teams?.map(team => (
                  <label key={team.id} className="flex items-center gap-3 p-2 hover:bg-surface-variant rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTeams(prev => [...prev, team.id])
                        else setSelectedTeams(prev => prev.filter(id => id !== team.id))
                      }}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                    <span className="text-sm text-on-surface dark:text-white truncate">{team.name}</span>
                  </label>
                ))}
                {!teams?.length && <p className="text-sm text-secondary p-2">No teams available.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end pt-4 border-t border-outline-variant/30">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="h-10 px-4 rounded-xl font-medium text-secondary hover:bg-surface-variant transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="h-10 px-6 rounded-xl font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : id ? "Update Site" : "Create Site"}
        </button>
      </div>
    </form>
  )
}
