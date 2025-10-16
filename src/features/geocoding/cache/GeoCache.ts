import { GeoPoint } from '@/core/models/GeoPoint'
import { IndexedDBProvider } from '@/core/storage/providers/IndexedDBProvider'

export class GeoCache {
  private storageProvider = new IndexedDBProvider()
  private prefix = 'geo:'
  private memoryCache = new Map<string, GeoPoint>()

  async get(address: string): Promise<GeoPoint | null> {
    const normalizedAddress = this.normalizeAddress(address)

    // メモリキャッシュチェック
    if (this.memoryCache.has(normalizedAddress)) {
      return this.memoryCache.get(normalizedAddress)!
    }

    // IndexedDBキャッシュチェック
    try {
      const key = this.prefix + normalizedAddress
      const data = await this.storageProvider.load(key)

      if (data) {
        const geoPoint = GeoPoint.fromArray(data as [number, number])
        this.memoryCache.set(normalizedAddress, geoPoint)
        return geoPoint
      }
    } catch (error) {
      console.error('GeoCache load error:', error)
    }

    return null
  }

  async set(address: string, geoPoint: GeoPoint): Promise<void> {
    const normalizedAddress = this.normalizeAddress(address)

    // メモリキャッシュに保存
    this.memoryCache.set(normalizedAddress, geoPoint)

    // IndexedDBに保存
    try {
      const key = this.prefix + normalizedAddress
      await this.storageProvider.save(key, geoPoint.toArray())
    } catch (error) {
      console.error('GeoCache save error:', error)
    }
  }

  private normalizeAddress(address: string): string {
    return address.trim().toLowerCase()
  }

  clearMemoryCache(): void {
    this.memoryCache.clear()
  }
}
