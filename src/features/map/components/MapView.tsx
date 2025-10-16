'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import { ReactNode } from 'react'
import 'leaflet/dist/leaflet.css'

export interface MapViewProps {
  center?: [number, number]
  zoom?: number
  children?: ReactNode
}

export function MapView({
  center = [35.6762, 139.6503], // 東京
  zoom = 2,
  children
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {children}
    </MapContainer>
  )
}
