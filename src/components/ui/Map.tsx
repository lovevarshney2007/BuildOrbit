"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon in leaflet with Next.js/Webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

interface MapProps {
  latitude: number
  longitude: number
  radiusMeters?: number
  onChange?: (lat: number, lng: number) => void
  readOnly?: boolean
}

function LocationMarker({ position, onChange, readOnly }: { position: [number, number], onChange?: (lat: number, lng: number) => void, readOnly?: boolean }) {
  const map = useMapEvents({
    click(e) {
      if (!readOnly && onChange) {
        onChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  // Recenter map when position prop changes significantly
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 0.5 })
  }, [position[0], position[1], map])

  return position[0] !== 0 || position[1] !== 0 ? (
    <Marker position={position} icon={icon} />
  ) : null
}

export default function Map({ latitude, longitude, radiusMeters, onChange, readOnly = false }: MapProps) {
  // Use New Delhi as default if coordinates are not set or 0,0
  const isDefault = !latitude && !longitude
  const initialPos: [number, number] = isDefault ? [28.6139, 77.2090] : [latitude, longitude]
  
  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 border border-outline-variant/50">
      <MapContainer 
        center={initialPos} 
        zoom={isDefault ? 10 : 15} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationMarker position={initialPos} onChange={onChange} readOnly={readOnly} />
        
        {!isDefault && radiusMeters && radiusMeters > 0 && (
          <Circle 
            center={initialPos} 
            radius={radiusMeters} 
            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.2, weight: 2 }} 
          />
        )}
      </MapContainer>
    </div>
  )
}
