"use client"

import dynamic from "next/dynamic"

// Dynamically import the Map component with ssr disabled
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center rounded-xl border border-outline-variant/50 text-secondary">
      <div className="flex flex-col items-center gap-2">
        <span className="material-symbols-outlined animate-spin">refresh</span>
        <span className="text-sm font-medium">Loading map...</span>
      </div>
    </div>
  ),
})

interface LocationPickerProps {
  latitude: number | ""
  longitude: number | ""
  radiusMeters?: number | ""
  onChange?: (lat: number, lng: number) => void
  readOnly?: boolean
  className?: string
}

export function LocationPicker({ 
  latitude, 
  longitude, 
  radiusMeters, 
  onChange, 
  readOnly = false,
  className = "h-[400px] w-full"
}: LocationPickerProps) {
  return (
    <div className={className}>
      <Map 
        latitude={typeof latitude === "number" ? latitude : 0} 
        longitude={typeof longitude === "number" ? longitude : 0} 
        radiusMeters={typeof radiusMeters === "number" ? radiusMeters : 0}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  )
}
