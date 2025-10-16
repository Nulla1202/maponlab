'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { GoogleMapsProvider, GeoCache } from '@/features/geocoding'
import { Paper } from '@/core/models/Paper'

export function useUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState<string>('')

  const uploadPaper = async (file: File): Promise<Paper | null> => {
    setIsLoading(true)
    setError(null)
    setProgress('PDFを解析中...')

    try {
      // PDF解析モジュールを動的インポート（クライアントサイドのみ）
      const { PDFJSParser, GeminiExtractor } = await import('@/features/pdf-parser')

      // 1. PDF解析
      const parser = new PDFJSParser()
      const { text, title } = await parser.parse(file)

      if (!text || text.trim().length === 0) {
        throw new Error('PDFからテキストを抽出できませんでした')
      }

      // 2. Gemini APIで著者・所属機関を抽出
      setProgress('AI解析中（著者・所属機関を抽出）...')
      const geminiExtractor = new GeminiExtractor()
      const result = await geminiExtractor.extract(text)

      const authors = result.authors
      const affiliations = result.affiliations

      console.log(`Gemini抽出成功: 著者${authors.length}名, 所属${affiliations.length}件`)

      // 4. ジオコーディング（Google Maps API、キャッシュ優先）
      if (affiliations.length > 0) {
        setProgress(`ジオコーディング中... (${affiliations.length}件)`)
        const geocoder = new GoogleMapsProvider()
        const geoCache = new GeoCache()

        let successCount = 0
        for (let i = 0; i < affiliations.length; i++) {
          const affiliation = affiliations[i]
          setProgress(`ジオコーディング中... (${i + 1}/${affiliations.length}件)`)

          // キャッシュチェック
          let geoPoint = await geoCache.get(affiliation.name)

          // キャッシュになければAPIで取得
          if (!geoPoint) {
            console.log(`ジオコーディング: "${affiliation.name}"`)
            geoPoint = await geocoder.geocode(affiliation.name)
            if (geoPoint) {
              console.log(`✓ 成功: ${affiliation.name} -> (${geoPoint.lat}, ${geoPoint.lon})`)
              await geoCache.set(affiliation.name, geoPoint)
              successCount++
            } else {
              console.warn(`✗ 失敗: ${affiliation.name}`)
            }
          } else {
            console.log(`キャッシュヒット: ${affiliation.name} -> (${geoPoint.lat}, ${geoPoint.lon})`)
            successCount++
          }

          affiliation.geoPoint = geoPoint
        }

        console.log(`ジオコーディング完了: ${successCount}/${affiliations.length}件成功`)
      }

      // 5. Paper作成
      const paper = new Paper(
        uuidv4(),
        title || file.name.replace('.pdf', ''),
        authors,
        affiliations,
        null,
        new Date()
      )

      setProgress('完了')
      return paper
    } catch (err) {
      const error = err as Error
      setError(error)
      console.error('Upload error:', error)
      return null
    } finally {
      setIsLoading(false)
      setTimeout(() => setProgress(''), 2000)
    }
  }

  return { uploadPaper, isLoading, error, progress }
}
