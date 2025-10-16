import { Affiliation } from './Affiliation'

export class Author {
  constructor(
    public name: string,
    public affiliation: Affiliation | null = null
  ) {}

  toJSON() {
    return {
      name: this.name,
      affiliation: this.affiliation ? this.affiliation.toJSON() : null,
    }
  }

  static fromJSON(data: any): Author {
    return new Author(
      data.name,
      data.affiliation ? Affiliation.fromJSON(data.affiliation) : null
    )
  }
}
