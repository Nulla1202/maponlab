# 🚀 PaperMap - 次のステップガイド

## ✅ 完了した項目

以下の基盤となる実装が完了しています：

### 1. プロジェクト基盤
- ✅ Next.js 14 + TypeScript + Tailwind CSSのセットアップ
- ✅ 疎結合なディレクトリ構造の構築
- ✅ ESLint・Prettier設定

### 2. コアアーキテクチャ
- ✅ ドメインモデル（Paper, Author, Affiliation, GeoPoint）
- ✅ ストレージインターフェース（IStorageProvider, IPaperRepository）
- ✅ IndexedDBプロバイダー実装
- ✅ PaperRepository実装

### 3. UIコンポーネント
- ✅ 共通コンポーネント（Button, Loading）
- ✅ レイアウト（ナビゲーション付き）
- ✅ ホームページ
- ✅ 地図ページ（プレースホルダー）

### 4. 設定
- ✅ アプリケーション設定（app.config.ts）
- ✅ API設定（api.config.ts）
- ✅ 環境変数テンプレート（.env.example）

---

## 🔨 次に実装すべき機能

以下の優先順位で実装を進めることを推奨します：

### Phase 1: 地図表示機能（優先度：高）

#### 1.1 Leaflet地図コンポーネント

**実装ファイル:** `src/features/map/components/MapView.tsx`

```typescript
'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// マーカーアイコンの修正（Next.js対応）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/map-markers/marker-icon-2x.png',
  iconUrl: '/map-markers/marker-icon.png',
  shadowUrl: '/map-markers/marker-shadow.png',
})

export function MapView() {
  return (
    <MapContainer
      center={[35.6762, 139.6503]} // 東京
      zoom={2}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  )
}
```

**必要な作業:**
1. Leafletマーカー画像を `public/map-markers/` に配置
2. `src/app/map/page.tsx` でMapViewコンポーネントを使用
3. 動的インポートでSSRを無効化

#### 1.2 マーカー表示

**実装ファイル:** `src/features/map/components/MapMarker.tsx`

```typescript
import { Marker, Popup } from 'react-leaflet'
import { GeoPoint } from '@/core/models/GeoPoint'

interface MapMarkerProps {
  geoPoint: GeoPoint
  title: string
  authors: string[]
}

export function MapMarker({ geoPoint, title, authors }: MapMarkerProps) {
  return (
    <Marker position={geoPoint.toArray()}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-sm">{title}</h3>
          <ul className="text-xs mt-1">
            {authors.map((author, i) => (
              <li key={i}>{author}</li>
            ))}
          </ul>
        </div>
      </Popup>
    </Marker>
  )
}
```

---

### Phase 2: PDF解析機能（優先度：高）

#### 2.1 PDF.jsを使用した基本解析

**実装ファイル:** `src/features/pdf-parser/parsers/PDFJSParser.ts`

```bash
# パッケージ追加
npm install pdfjs-dist
```

```typescript
import * as pdfjsLib from 'pdfjs-dist'

export class PDFJSParser {
  async parse(file: File): Promise<{ text: string }> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return { text: fullText }
  }
}
```

#### 2.2 著者情報抽出

**実装ファイル:** `src/features/pdf-parser/extractors/AuthorExtractor.ts`

```typescript
import { Author } from '@/core/models/Author'

export class AuthorExtractor {
  extract(text: string): Author[] {
    // 簡易的な実装例
    // 実際には正規表現やNLPを使用してより高度に抽出
    const lines = text.split('\n')
    const authors: Author[] = []

    // "Author:" や "Authors:" の後の行を抽出
    const authorPattern = /authors?:?\s*(.*)/i

    for (const line of lines) {
      const match = line.match(authorPattern)
      if (match) {
        const authorNames = match[1].split(',').map(n => n.trim())
        authors.push(...authorNames.map(name => new Author(name)))
        break
      }
    }

    return authors
  }
}
```

---

### Phase 3: ジオコーディング機能（優先度：中）

#### 3.1 Nominatim API連携

**実装ファイル:** `src/features/geocoding/providers/NominatimProvider.ts`

```typescript
import { GeoPoint } from '@/core/models/GeoPoint'
import { apiConfig } from '@/config/api.config'

export class NominatimProvider {
  private lastRequestTime = 0

  async geocode(address: string): Promise<GeoPoint | null> {
    // レート制限対策（1秒に1リクエスト）
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < apiConfig.nominatim.rateLimit) {
      await new Promise(resolve =>
        setTimeout(resolve, apiConfig.nominatim.rateLimit - timeSinceLastRequest)
      )
    }
    this.lastRequestTime = Date.now()

    const url = new URL('/search', apiConfig.nominatim.baseUrl)
    url.searchParams.set('q', address)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': apiConfig.nominatim.userAgent,
      },
    })

    const data = await response.json()

    if (data && data.length > 0) {
      return new GeoPoint(parseFloat(data[0].lat), parseFloat(data[0].lon))
    }

    return null
  }
}
```

#### 3.2 キャッシュ機能

**実装ファイル:** `src/features/geocoding/cache/GeoCache.ts`

```typescript
import { GeoPoint } from '@/core/models/GeoPoint'
import { IndexedDBProvider } from '@/core/storage/providers/IndexedDBProvider'

export class GeoCache {
  private storageProvider = new IndexedDBProvider()
  private prefix = 'geo:'

  async get(address: string): Promise<GeoPoint | null> {
    const key = this.prefix + address
    const data = await this.storageProvider.load(key)

    if (data) {
      return GeoPoint.fromArray(data as [number, number])
    }

    return null
  }

  async set(address: string, geoPoint: GeoPoint): Promise<void> {
    const key = this.prefix + address
    await this.storageProvider.save(key, geoPoint.toArray())
  }
}
```

---

### Phase 4: アップロード機能（優先度：中）

#### 4.1 アップロードボタンコンポーネント

**実装ファイル:** `src/features/upload/components/UploadButton.tsx`

```typescript
'use client'

import { useRef } from 'react'
import { Button } from '@/shared/components/Button/Button'
import { appConfig } from '@/config/app.config'

interface UploadButtonProps {
  onUpload: (file: File) => void
  isLoading?: boolean
}

export function UploadButton({ onUpload, isLoading }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > appConfig.maxUploadSize) {
      alert('ファイルサイズが大きすぎます（最大10MB）')
      return
    }

    if (!appConfig.supportedFileTypes.includes(file.type)) {
      alert('PDFファイルのみアップロード可能です')
      return
    }

    onUpload(file)
  }

  return (
    <>
      <Button onClick={handleClick} isLoading={isLoading}>
        PDFをアップロード
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
    </>
  )
}
```

#### 4.2 アップロード処理フック

**実装ファイル:** `src/features/upload/hooks/useUpload.ts`

```typescript
'use client'

import { useState } from 'react'
import { PDFJSParser } from '@/features/pdf-parser/parsers/PDFJSParser'
import { AuthorExtractor } from '@/features/pdf-parser/extractors/AuthorExtractor'
import { NominatimProvider } from '@/features/geocoding/providers/NominatimProvider'
import { Paper } from '@/core/models/Paper'
import { Affiliation } from '@/core/models/Affiliation'
import { v4 as uuidv4 } from 'uuid'

export function useUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const uploadPaper = async (file: File): Promise<Paper | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. PDF解析
      const parser = new PDFJSParser()
      const { text } = await parser.parse(file)

      // 2. 著者抽出
      const authorExtractor = new AuthorExtractor()
      const authors = authorExtractor.extract(text)

      // 3. 所属機関からジオコーディング（サンプル実装）
      // 実際にはAffiliationExtractorで所属機関を抽出する
      const affiliations: Affiliation[] = []

      // 4. Paper作成
      const paper = new Paper(
        uuidv4(),
        file.name.replace('.pdf', ''),
        authors,
        affiliations,
        null,
        new Date()
      )

      return paper
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { uploadPaper, isLoading, error }
}
```

**必要な追加パッケージ:**
```bash
npm install uuid
npm install -D @types/uuid
```

---

### Phase 5: 統合とテスト（優先度：中）

#### 5.1 Paper管理フック

**実装ファイル:** `src/features/papers/hooks/usePapers.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Paper } from '@/core/models/Paper'
import { IndexedDBProvider } from '@/core/storage/providers/IndexedDBProvider'
import { PaperRepository } from '@/core/storage/repositories/PaperRepository'

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const repository = new PaperRepository(new IndexedDBProvider())

  const loadPapers = async () => {
    try {
      setLoading(true)
      const allPapers = await repository.findAll()
      setPapers(allPapers)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addPaper = async (paper: Paper) => {
    await repository.save(paper)
    await loadPapers()
  }

  const deletePaper = async (id: string) => {
    await repository.delete(id)
    await loadPapers()
  }

  useEffect(() => {
    loadPapers()
  }, [])

  return { papers, loading, error, addPaper, deletePaper, reload: loadPapers }
}
```

---

## 🧪 テスト実装

### ユニットテストの追加

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**実装例:** `src/core/models/GeoPoint.test.ts`

```typescript
import { GeoPoint } from './GeoPoint'

describe('GeoPoint', () => {
  it('should create a valid GeoPoint', () => {
    const point = new GeoPoint(35.6762, 139.6503)
    expect(point.lat).toBe(35.6762)
    expect(point.lon).toBe(139.6503)
  })

  it('should throw error for invalid latitude', () => {
    expect(() => new GeoPoint(100, 0)).toThrow()
  })

  it('should calculate distance correctly', () => {
    const tokyo = new GeoPoint(35.6762, 139.6503)
    const osaka = new GeoPoint(34.6937, 135.5023)
    const distance = tokyo.distanceTo(osaka)
    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(500) // 約400km
  })
})
```

---

## 📊 開発の進め方

### 推奨順序

1. **地図表示機能** → すぐに視覚的なフィードバックが得られる
2. **PDF解析機能** → コア機能の実装
3. **ジオコーディング** → 地図とPDF解析をつなぐ
4. **アップロード機能** → ユーザー操作の完成
5. **テスト実装** → 品質保証

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# リント
npm run lint

# フォーマット
npm run format

# ビルド
npm run build
```

---

## 🐛 既知の問題と対処法

### 1. Leafletマーカーが表示されない

**原因:** Next.jsのSSRとLeafletの互換性問題

**対処法:**
```typescript
// MapViewを動的インポート
import dynamic from 'next/dynamic'

const MapView = dynamic(
  () => import('@/features/map/components/MapView').then(mod => mod.MapView),
  { ssr: false, loading: () => <Loading /> }
)
```

### 2. IndexedDBが使えない環境

**対処法:** LocalStorageフォールバックを実装
```typescript
// src/core/storage/providers/LocalStorageProvider.ts
export class LocalStorageProvider implements IStorageProvider {
  // localStorage実装
}
```

### 3. Nominatim APIレート制限

**対処法:**
- GeoCacheを必ず使用
- バッチ処理時は1秒ごとに1件ずつ処理
- 必要に応じて有料のジオコーディングサービスに切り替え

---

## 🎯 最終目標

すべての機能が実装されると、以下のワークフローが実現します：

1. ユーザーがPDFをアップロード
2. PDF解析により著者・所属機関を抽出
3. 所属機関をジオコーディングして座標取得
4. IndexedDBに保存
5. 地図上にマーカー表示
6. マーカークリックで論文詳細表示

---

## 💡 さらなる拡張案

- Google OAuth認証の実装
- Google Drive連携
- AI要約機能（OpenAI API）
- 論文検索・フィルタ機能
- 統計ダッシュボード
- エクスポート機能（JSON/CSV）

頑張ってください！
