'use client'

import { Marker, Popup } from 'react-leaflet'
import { GeoPoint } from '@/core/models/GeoPoint'
import L from 'leaflet'

// Leafletマーカーアイコンの修正（Next.js対応）
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export interface MapMarkerProps {
  geoPoint: GeoPoint
  title: string
  authors: string[]
  affiliation?: string
}

export function MapMarker({ geoPoint, title, authors, affiliation }: MapMarkerProps) {
  return (
    <Marker position={geoPoint.toArray()} icon={icon}>
      <Popup>
        <div className="p-2 min-w-[250px]">
          <h3 className="font-bold text-sm mb-3">{title}</h3>

          <div className="text-xs mb-3">
            <p className="font-semibold mb-1">著者:</p>
            <div className="ml-2">
              {authors.map((author, i) => (
                <p key={i} className="mb-0.5">{author}</p>
              ))}
            </div>
          </div>

          {affiliation && (
            <div className="text-xs">
              <p className="font-semibold mb-1">所属:</p>
              <p className="text-gray-700 ml-2">
                📍 {affiliation}
              </p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
