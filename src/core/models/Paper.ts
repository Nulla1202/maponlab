import { Author } from './Author'
import { Affiliation } from './Affiliation'

export class Paper {
  constructor(
    public id: string,
    public title: string,
    public authors: Author[],
    public affiliations: Affiliation[],
    public pdfUrl: string | null = null,
    public uploadedAt: Date = new Date()
  ) {}

  hasGeoLocation(): boolean {
    return this.affiliations.some((a) => a.hasGeoLocation())
  }

  getUniqueCountries(): string[] {
    const countries = this.affiliations
      .map((a) => a.country)
      .filter((c): c is string => c !== null)
    return [...new Set(countries)]
  }

  getGeoPoints() {
    return this.affiliations
      .map((a) => a.geoPoint)
      .filter((g) => g !== null)
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      authors: this.authors.map((a) => a.toJSON()),
      affiliations: this.affiliations.map((a) => a.toJSON()),
      pdfUrl: this.pdfUrl,
      uploadedAt: this.uploadedAt.toISOString(),
    }
  }

  static fromJSON(data: any): Paper {
    return new Paper(
      data.id,
      data.title,
      data.authors.map((a: any) => Author.fromJSON(a)),
      data.affiliations.map((a: any) => Affiliation.fromJSON(a)),
      data.pdfUrl,
      new Date(data.uploadedAt)
    )
  }
}
