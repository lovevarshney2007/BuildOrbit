"use client"

import dynamic from "next/dynamic"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, LocateFixed } from "lucide-react"

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
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true)
        try {
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`)
          const data = await res.json()
          if (data && data.features) {
            setSuggestions(data.features)
            setShowSuggestions(true)
          }
        } catch (err) {
          console.error("Autocomplete failed:", err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelect = (feature: any) => {
    if (onChange) {
      // Photon returns coordinates as [longitude, latitude]
      onChange(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    }
    const name = feature.properties.name || ""
    const city = feature.properties.city || feature.properties.state || ""
    setSearchQuery([name, city].filter(Boolean).join(", "))
    setShowSuggestions(false)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    
    setIsSearching(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (onChange) {
          onChange(position.coords.latitude, position.coords.longitude)
        }
        setSearchQuery("My Location")
        setIsSearching(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to retrieve your location. Please check your browser permissions.")
        setIsSearching(false)
      }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && (
        <div className="relative flex gap-2" ref={wrapperRef}>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for a location... (e.g., Mahagun, Noida)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary text-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">refresh</span>
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface dark:bg-slate-900 border border-outline-variant rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {suggestions.map((feature, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(feature)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 border-b border-outline-variant/30 last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-sm font-medium text-on-surface dark:text-white truncate">
                        {feature.properties.name}
                      </span>
                      <span className="text-xs text-secondary dark:text-slate-400 truncate">
                        {[
                          feature.properties.street, 
                          feature.properties.district,
                          feature.properties.city, 
                          feature.properties.state, 
                          feature.properties.country
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            title="Use My Location"
            className="h-10 w-10 shrink-0 rounded-lg border border-outline-variant bg-transparent text-on-surface dark:text-white focus:outline-none focus:border-primary flex items-center justify-center hover:bg-surface-variant transition-colors"
          >
            <LocateFixed className="w-5 h-5 text-secondary" />
          </button>
        </div>
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
