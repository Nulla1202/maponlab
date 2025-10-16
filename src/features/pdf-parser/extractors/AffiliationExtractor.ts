import { Affiliation } from '@/core/models/Affiliation'

export class AffiliationExtractor {
  extract(text: string): Affiliation[] {
    const lines = text.split('\n').slice(0, 100) // 最初の100行を検索
    const affiliations: Affiliation[] = []

    // 大学・機関のキーワード
    const universityPatterns = [
      /University/i,
      /Institut/i,
      /College/i,
      /Academy/i,
      /School/i,
      /Laboratory/i,
      /Center/i,
      /Centre/i,
      /大学/,
      /研究所/,
      /学院/
    ]

    for (const line of lines) {
      const trimmed = line.trim()

      // 機関名のパターンにマッチするかチェック
      const hasInstitution = universityPatterns.some(pattern =>
        pattern.test(trimmed)
      )

      if (hasInstitution && trimmed.length > 5 && trimmed.length < 200) {
        // 国名を抽出（簡易版）
        const country = this.extractCountry(trimmed)

        affiliations.push(new Affiliation(trimmed, country))
      }

      if (affiliations.length >= 10) break
    }

    // 重複を削除
    const uniqueAffiliations = affiliations.filter(
      (aff, index, self) =>
        index === self.findIndex(a => a.name === aff.name)
    )

    return uniqueAffiliations
  }

  private extractCountry(text: string): string | null {
    const countryPatterns: Record<string, RegExp> = {
      'Japan': /Japan|日本/i,
      'USA': /USA|United States|America/i,
      'UK': /UK|United Kingdom|England|Britain/i,
      'Germany': /Germany|Deutschland/i,
      'France': /France|française/i,
      'China': /China|中国/i,
      'South Korea': /Korea|韓国/i,
      'Canada': /Canada/i,
      'Australia': /Australia/i,
      'Singapore': /Singapore/i,
      'Switzerland': /Switzerland/i,
      'Netherlands': /Netherlands/i,
      'Sweden': /Sweden/i,
      'Italy': /Italy/i,
      'Spain': /Spain/i
    }

    for (const [country, pattern] of Object.entries(countryPatterns)) {
      if (pattern.test(text)) {
        return country
      }
    }

    return null
  }
}
