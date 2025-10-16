import { GeoPoint } from './GeoPoint'

export class Affiliation {
  constructor(
    public name: string,
    public country: string | null = null,
    public city: string | null = null,
    public geoPoint: GeoPoint | null = null
  ) {}

  hasGeoLocation(): boolean {
    return this.geoPoint !== null
  }

  toJSON() {
    return {
      name: this.name,
      country: this.country,
      city: this.city,
      geoPoint: this.geoPoint ? this.geoPoint.toArray() : null,
    }
  }

  static fromJSON(data: any): Affiliation {
    return new Affiliation(
      data.name,
      data.country,
      data.city,
      data.geoPoint ? GeoPoint.fromArray(data.geoPoint) : null
    )
  }
}
