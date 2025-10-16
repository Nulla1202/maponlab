import { GeoPoint } from '@/core/models/GeoPoint'
import { apiConfig } from '@/config/api.config'

export class NominatimProvider {
  private lastRequestTime = 0

  async geocode(address: string): Promise<GeoPoint | null> {
    if (!address || address.trim().length === 0) {
      return null
    }

    // レート制限対策（1秒に1リクエスト）
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < apiConfig.nominatim.rateLimit) {
      await new Promise(resolve =>
        setTimeout(resolve, apiConfig.nominatim.rateLimit - timeSinceLastRequest)
      )
    }
    this.lastRequestTime = Date.now()

    try {
      const url = new URL('/search', apiConfig.nominatim.baseUrl)
      url.searchParams.set('q', address)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '1')

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': apiConfig.nominatim.userAgent,
        },
      })

      if (!response.ok) {
        console.error('Nominatim API error:', response.statusText)
        return null
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)

        if (!isNaN(lat) && !isNaN(lon)) {
          return new GeoPoint(lat, lon)
        }
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }
}
