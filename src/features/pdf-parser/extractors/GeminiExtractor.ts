import { Author } from '@/core/models/Author'
import { Affiliation } from '@/core/models/Affiliation'

export interface GeminiExtractionResult {
  authors: Author[]
  affiliations: Affiliation[]
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export class GeminiExtractor {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  }

  async extract(text: string): Promise<GeminiExtractionResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured')
    }

    // PDFテキストの最初の1234文字を使用
    const truncatedText = text.slice(0, 100000)

    const prompt = `
以下の学術論文のテキストから、著者名と所属機関を抽出してください。

**重要な指示:**
1. 著者名は「名 姓」または「姓, 名」形式で抽出
2. 所属機関は大学、研究所、企業などの組織名
3. 所属機関には国名も含めてください（可能であれば）
4. 必ず以下のJSON形式で返してください（他のテキストは含めないでください）

**JSON形式:**
{
  "authors": ["著者名1", "著者名2", ...],
  "affiliations": [
    {"name": "機関名1", "country": "国名1"},
    {"name": "機関名2", "country": "国名2"}
  ]
}

**論文テキスト:**
${truncatedText}
`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2, // 低めの温度で安定した出力
              maxOutputTokens: 1000,
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()

      // レスポンスからテキストを取得
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No response from Gemini API')
      }

      // JSONを抽出（```json ... ``` のマークダウンブロックを考慮）
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       generatedText.match(/({[\s\S]*})/)

      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from Gemini response')
      }

      const jsonText = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonText)

      // Author[]に変換
      const authors: Author[] = (parsed.authors || [])
        .filter((name: string) => name && name.length > 0)
        .slice(0, 20) // 最大20人まで
        .map((name: string) => new Author(name.trim()))

      // Affiliation[]に変換
      const affiliations: Affiliation[] = (parsed.affiliations || [])
        .filter((aff: any) => aff.name && aff.name.length > 0)
        .slice(0, 15) // 最大15機関まで
        .map((aff: any) => new Affiliation(
          aff.name.trim(),
          aff.country?.trim() || null,
          null, // city
          null  // geoPoint (後でジオコーディング)
        ))

      return { authors, affiliations }
    } catch (error) {
      console.error('Gemini extraction error:', error)
      throw error
    }
  }
}
