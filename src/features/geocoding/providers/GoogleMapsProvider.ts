import { GeoPoint } from '@/core/models/GeoPoint'

export class GoogleMapsProvider {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  }

  async geocode(address: string): Promise<GeoPoint | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured')
    }

    if (!address || address.trim().length === 0) {
      return null
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
      url.searchParams.set('address', address)
      url.searchParams.set('key', this.apiKey)

      const response = await fetch(url.toString())

      if (!response.ok) {
        console.error('Google Maps API error:', response.statusText)
        return null
      }

      const data = await response.json()

      // APIエラーチェック
      if (data.status === 'REQUEST_DENIED') {
        console.error('Google Maps API request denied:', data.error_message)
        throw new Error(`Google Maps API: ${data.error_message}`)
      }

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('Google Maps API quota exceeded')
        throw new Error('Google Maps API quota exceeded')
      }

      if (data.status === 'ZERO_RESULTS') {
        console.warn(`Google Maps: No results for "${address}"`)
        return null
      }

      // 成功時の処理
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        const lat = location.lat
        const lon = location.lng

        if (!isNaN(lat) && !isNaN(lon)) {
          return new GeoPoint(lat, lon)
        }
      }

      return null
    } catch (error) {
      console.error('Google Maps geocoding error:', error)
      throw error
    }
  }
}
