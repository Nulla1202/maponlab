export class GeoPoint {
  constructor(
    public lat: number,
    public lon: number
  ) {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }
  }

  toArray(): [number, number] {
    return [this.lat, this.lon]
  }

  static fromArray(coords: [number, number]): GeoPoint {
    return new GeoPoint(coords[0], coords[1])
  }

  distanceTo(other: GeoPoint): number {
    // Haversine formula
    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(other.lat - this.lat)
    const dLon = this.toRadians(other.lon - this.lon)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.lat)) *
        Math.cos(this.toRadians(other.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
