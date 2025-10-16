import { Author } from '@/core/models/Author'

export class AuthorExtractor {
  extract(text: string): Author[] {
    const lines = text.split('\n').slice(0, 50) // 最初の50行を検索
    const authors: Author[] = []

    // パターン1: "Authors:" または "Author:" の後に続く名前
    const authorPattern = /(?:authors?|by):?\s*([\w\s,\.]+)/i

    for (const line of lines) {
      const match = line.match(authorPattern)
      if (match && match[1]) {
        const authorNames = match[1]
          .split(/[,;]/)
          .map(n => n.trim())
          .filter(n => n.length > 2 && n.length < 50)

        authors.push(...authorNames.map(name => new Author(name)))

        if (authors.length > 0) break
      }
    }

    // パターン2: 大文字で始まる名前のパターン（簡易版）
    if (authors.length === 0) {
      const namePattern = /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/

      for (const line of lines) {
        const trimmed = line.trim()
        if (namePattern.test(trimmed)) {
          authors.push(new Author(trimmed))
          if (authors.length >= 5) break // 最大5人まで
        }
      }
    }

    // 重複を削除
    const uniqueAuthors = authors.filter((author, index, self) =>
      index === self.findIndex(a => a.name === author.name)
    )

    return uniqueAuthors.slice(0, 10) // 最大10人まで
  }
}
