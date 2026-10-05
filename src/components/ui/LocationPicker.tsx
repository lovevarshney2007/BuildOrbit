"use client"

import dynamic from "next/dynamic"

import { useState } from "react"
import { Search } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !onChange) return

    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`)
      const data = await res.json()
      if (data && data.length > 0) {
        onChange(parseFloat(data[0].lat), parseFloat(data[0].lon))
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (err) {
      console.error("Geocoding failed:", err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary text-sm"
          />
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery.trim()}
            className="h-10 px-4 flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
      )}
      <div className={className}>
        <Map 
          latitude={typeof latitude === "number" ? latitude : 0} 
          longitude={typeof longitude === "number" ? longitude : 0} 
          radiusMeters={typeof radiusMeters === "number" ? radiusMeters : 0}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
