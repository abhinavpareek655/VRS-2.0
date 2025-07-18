"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
  const data = await res.json()
  return data.display_name || `${lat}, ${lng}`
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

function CenterMapOnMarker({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, map.getZoom(), { animate: true })
    }
  }, [position, map])
  return null
}

export default function MapWithSearch({ value, onLocationChange }: {
  value: string,
  onLocationChange: (address: string, latlng: [number, number]) => void
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState(value)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hoveredSuggestion, setHoveredSuggestion] = useState<any | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce the address for autocomplete
  const debouncedAddress = useDebouncedValue(address, 300)

  // Fix default marker icon for leaflet in React (client only)
  useEffect(() => {
    if (typeof window !== "undefined" && L && L.Icon && L.Icon.Default) {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
    }
  }, [])

  // Get user's current location on mount
  useEffect(() => {
    if (!markerPosition && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setMarkerPosition(coords)
          const addr = await reverseGeocode(coords[0], coords[1])
          setAddress(addr)
          onLocationChange(addr, coords)
        },
        async () => {
          // fallback: try IP geolocation
          try {
            const res = await fetch("https://ipapi.co/json/")
            const data = await res.json()
            const coords: [number, number] = [data.latitude, data.longitude]
            setMarkerPosition(coords)
            const addr = await reverseGeocode(coords[0], coords[1])
            setAddress(addr)
            onLocationChange(addr, coords)
          } catch {
            setMarkerPosition([19.076, 72.8777]) // Mumbai fallback
          }
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch suggestions from Nominatim (debounced)
  useEffect(() => {
    if (debouncedAddress.length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    const controller = new AbortController()
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedAddress)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [debouncedAddress])

  // Handle suggestion select
  const handleSelect = (suggestion: any) => {
    setAddress(suggestion.display_name)
    setMarkerPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)])
    onLocationChange(suggestion.display_name, [parseFloat(suggestion.lat), parseFloat(suggestion.lon)])
    setShowSuggestions(false)
    setHoveredSuggestion(null)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
    setShowSuggestions(true)
    setHoveredSuggestion(null)
  }

  // Hide suggestions on blur (with delay for click)
  const handleBlur = () => setTimeout(() => setShowSuggestions(false), 100)

  function LocationMarker() {
    useMapEvents({
      click: async (e) => {
        setMarkerPosition([e.latlng.lat, e.latlng.lng])
        const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng)
        setAddress(addr)
        onLocationChange(addr, [e.latlng.lat, e.latlng.lng])
      },
    })
    return markerPosition ? (
      <Marker position={markerPosition} draggable={true}
        eventHandlers={{
          dragend: async (e) => {
            const marker = e.target
            const latlng = marker.getLatLng()
            setMarkerPosition([latlng.lat, latlng.lng])
            const addr = await reverseGeocode(latlng.lat, latlng.lng)
            setAddress(addr)
            onLocationChange(addr, [latlng.lat, latlng.lng])
          }
        }}
      />
    ) : null
  }

  // Temporary marker for hovered suggestion
  const tempMarker: [number, number] | null = hoveredSuggestion && hoveredSuggestion.lat && hoveredSuggestion.lon
    ? [parseFloat(hoveredSuggestion.lat), parseFloat(hoveredSuggestion.lon)]
    : null

  // Helper to get a valid center for the map
  const getMapCenter = () => {
    if (tempMarker && tempMarker.length === 2) return tempMarker as [number, number];
    if (markerPosition && markerPosition.length === 2) return markerPosition as [number, number];
    return [19.076, 72.8777] as [number, number]; // fallback
  }

  return (
    <div className="relative" style={{ minHeight: 320 }}>
      <div className="relative z-[10000]">
        <input
          ref={inputRef}
          value={address}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder="📍 Search or select location"
          className="w-full border rounded px-3 py-2 text-base focus:ring-2 focus:ring-yellow-500"
          required
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 bg-white border rounded shadow max-h-40 overflow-y-auto z-[9999] mt-1">
            {loading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
            {suggestions.map((s, i) => (
              <div
                key={s.place_id || s.display_name + i}
                className={`p-2 cursor-pointer hover:bg-yellow-100 ${hoveredSuggestion === s ? 'bg-yellow-100' : ''}`}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setHoveredSuggestion(s)}
                onMouseLeave={() => setHoveredSuggestion(null)}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Map is absolutely positioned below the input/suggestions */}
      <div className="absolute left-0 right-0" style={{ top: 56, height: 250, zIndex: 1 }}>
        {(markerPosition || tempMarker) ? (
          <MapContainer center={getMapCenter()} zoom={13} style={{ height: "100%", width: "100%", borderRadius: 8 }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <CenterMapOnMarker position={tempMarker || markerPosition!} />
            {markerPosition && markerPosition.length === 2 && <LocationMarker />}
            {tempMarker && tempMarker.length === 2 && (
              <Marker position={tempMarker as [number, number]} />
            )}
          </MapContainer>
        ) : (
          <div className="text-gray-500 text-sm h-full flex items-center justify-center">Loading map...</div>
        )}
      </div>
    </div>
  )
} 