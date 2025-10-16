# 🏗️ PaperMap アーキテクチャドキュメント

## 目次
1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [レイヤー構成](#レイヤー構成)
3. [データフロー](#データフロー)
4. [主要コンポーネント](#主要コンポーネント)
5. [技術スタック](#技術スタック)
6. [セキュリティ](#セキュリティ)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [エラーハンドリング](#エラーハンドリング)

---

## アーキテクチャ概要

PaperMapは、**Clean Architecture** と **Feature-Sliced Design** を組み合わせた、疎結合で拡張性の高いアーキテクチャを採用しています。

### 設計原則

1. **関心の分離（Separation of Concerns）**
   - UI、ビジネスロジック、データアクセスを明確に分離

2. **依存性逆転の原則（Dependency Inversion Principle）**
   - 抽象に依存し、具象に依存しない
   - インターフェースを介した疎結合

3. **単一責任の原則（Single Responsibility Principle）**
   - 各モジュールは1つの責務のみを持つ

4. **開放閉鎖の原則（Open/Closed Principle）**
   - 拡張に対して開き、修正に対して閉じる

---

## レイヤー構成

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (app/)           │
│  - Next.js Pages/Layouts                    │
│  - ルーティング                              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Feature Layer (features/)             │
│  - 機能モジュール                            │
│  - UIコンポーネント + ロジック               │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼──────────┐  ┌─────────▼────────────┐
│ Shared Layer   │  │   Core Layer         │
│ (shared/)      │  │   (core/)            │
│ - 共通UI       │  │ - ビジネスロジック    │
│ - Utils        │  │ - ドメインモデル      │
└────────────────┘  │ - データアクセス      │
                    └──────────────────────┘
```

### 1. Presentation Layer（プレゼンテーション層）

**責務:** ルーティングとページ構成

**主要ファイル:**
- `app/page.tsx` - ホーム画面
- `app/map/page.tsx` - 地図表示
- `app/papers/[id]/page.tsx` - 論文詳細

**特徴:**
- Next.js App Routerを使用
- できるだけロジックを持たず、Feature Layerに委譲
- Server Components と Client Componentsを適切に分離

### 2. Feature Layer（機能層）

**責務:** 各機能の実装とUI

**主要機能モジュール:**

#### a. Upload Feature
```typescript
// features/upload/index.ts
export { UploadButton } from './components/UploadButton'
export { useUpload } from './hooks/useUpload'
```

論文のアップロード機能を提供します。

#### b. PDF Parser Feature
```typescript
// features/pdf-parser/index.ts
export { parsePDF } from './parsers/PyMuPDFParser'
export { extractAuthors } from './extractors/AuthorExtractor'
export { extractAffiliations } from './extractors/AffiliationExtractor'
```

PDFから著者情報と所属機関を抽出します。

#### c. Geocoding Feature
```typescript
// features/geocoding/index.ts
export { geocodeAddress } from './providers/NominatimProvider'
export { useGeoCache } from './cache/GeoCache'
```

所属機関名から地理座標を取得します。

#### d. Map Feature
```typescript
// features/map/index.ts
export { MapView } from './components/MapView'
export { useMap } from './hooks/useMap'
```

Leafletを使用した地図表示機能を提供します。

### 3. Core Layer（コア層）

**責務:** ビジネスロジックとドメインモデル

#### a. Domain Models

```typescript
// core/models/Paper.ts
export class Paper {
  constructor(
    public id: string,
    public title: string,
    public authors: Author[],
    public affiliations: Affiliation[],
    public uploadedAt: Date
  ) {}

  // ビジネスルール
  hasGeoLocation(): boolean {
    return this.affiliations.some(a => a.geoPoint !== null)
  }

  getUniqueCountries(): string[] {
    return [...new Set(this.affiliations.map(a => a.country))]
  }
}
```

#### b. Services

```typescript
// core/services/PaperService.ts
export class PaperService {
  constructor(
    private paperRepository: IPaperRepository,
    private pdfParser: IPDFParser,
    private geocodingService: IGeocodingService
  ) {}

  async processPaper(file: File): Promise<Paper> {
    // 1. PDF解析
    const parsed = await this.pdfParser.parse(file)

    // 2. ジオコーディング
    const affiliations = await Promise.all(
      parsed.affiliations.map(aff =>
        this.geocodingService.geocode(aff.name)
      )
    )

    // 3. 保存
    const paper = new Paper(
      generateId(),
      parsed.title,
      parsed.authors,
      affiliations,
      new Date()
    )

    await this.paperRepository.save(paper)
    return paper
  }
}
```

#### c. Storage Abstraction

```typescript
// core/storage/interfaces/IStorageProvider.ts
export interface IStorageProvider {
  save(key: string, data: unknown): Promise<void>
  load(key: string): Promise<unknown>
  delete(key: string): Promise<void>
  list(): Promise<string[]>
}

// core/storage/providers/IndexedDBProvider.ts
export class IndexedDBProvider implements IStorageProvider {
  private db: IDBDatabase

  async save(key: string, data: unknown): Promise<void> {
    const transaction = this.db.transaction(['papers'], 'readwrite')
    const store = transaction.objectStore('papers')
    await store.put({ id: key, data })
  }

  // ... その他の実装
}
```

**依存性注入の例:**

```typescript
// config/dependencies.ts
import { IndexedDBProvider } from '@/core/storage/providers/IndexedDBProvider'
import { PaperRepository } from '@/core/storage/repositories/PaperRepository'
import { PaperService } from '@/core/services/PaperService'

export function createPaperService(): PaperService {
  const storageProvider = new IndexedDBProvider()
  const paperRepository = new PaperRepository(storageProvider)
  const pdfParser = new PyMuPDFParser()
  const geocodingService = new GeocodingService()

  return new PaperService(paperRepository, pdfParser, geocodingService)
}
```

### 4. Shared Layer（共有層）

**責務:** 汎用的な共通機能

- UI コンポーネント（Button, Modal, Loading など）
- ユーティリティ関数（logger, errorHandler など）
- カスタムフック（useLocalStorage, useDebounce など）

---

## データフロー

### 論文アップロード〜地図表示までのフロー

```
┌──────────┐
│  ユーザー │
└─────┬────┘
      │ 1. PDFアップロード
      ▼
┌─────────────────┐
│ UploadButton    │ (Feature: Upload)
└─────┬───────────┘
      │ 2. File オブジェクト
      ▼
┌─────────────────┐
│ PaperService    │ (Core: Services)
└─────┬───────────┘
      │ 3. PDF解析リクエスト
      ▼
┌─────────────────┐
│ PDFParser       │ (Feature: PDF Parser)
└─────┬───────────┘
      │ 4. 著者・所属情報
      ▼
┌─────────────────┐
│ GeocodingService│ (Feature: Geocoding)
└─────┬───────────┘
      │ 5. 緯度経度情報
      ▼
┌─────────────────┐
│ PaperRepository │ (Core: Storage)
└─────┬───────────┘
      │ 6. 保存完了
      ▼
┌─────────────────┐
│ IndexedDB       │
│ / Google Drive  │
└─────┬───────────┘
      │ 7. 表示データ取得
      ▼
┌─────────────────┐
│ MapView         │ (Feature: Map)
└─────┬───────────┘
      │ 8. 地図に描画
      ▼
┌──────────┐
│ ユーザー  │
└──────────┘
```

### 状態管理

**方針:** 各機能モジュールが独自の状態を管理

```typescript
// features/papers/hooks/usePapers.ts
export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const paperService = useMemo(() => createPaperService(), [])

  const loadPapers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await paperService.getAll()
      setPapers(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [paperService])

  return { papers, loading, error, loadPapers }
}
```

グローバルな状態が必要な場合は、Context API を使用します。

```typescript
// features/auth/context/AuthContext.tsx
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|---|---|---|
| Next.js | 14.x | Reactフレームワーク |
| React | 18.x | UIライブラリ |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 3.x | スタイリング |
| Leaflet | 1.9.x | 地図表示 |
| React-Leaflet | 4.x | Leaflet Reactラッパー |

### PDF解析

| 技術 | 用途 |
|---|---|
| PyMuPDF (WASM) | PDFテキスト抽出 |
| pdf.js | ブラウザベースのPDF解析 |

### データ永続化

| 技術 | 用途 |
|---|---|
| IndexedDB | ローカルストレージ |
| Google Drive API | クラウドストレージ |

### API連携

| API | 用途 | 制限 |
|---|---|---|
| Nominatim (OSM) | ジオコーディング | 1リクエスト/秒 |
| Google OAuth 2.0 | 認証 | 無料枠あり |

### 開発ツール

| ツール | 用途 |
|---|---|
| ESLint | コード品質チェック |
| Prettier | コードフォーマット |
| Jest | ユニットテスト |
| Playwright | E2Eテスト |
| Storybook | コンポーネントカタログ |

---

## セキュリティ

### 1. 認証・認可

- Google OAuth 2.0 を使用
- トークンはセキュアに保管（httpOnly cookie）
- CSRF対策（Next.js組み込み）

### 2. データ保護

- クライアントサイドでの処理（PDFは外部サーバーに送信しない）
- IndexedDB はオリジン分離
- Google Drive API は最小権限のスコープのみ要求

### 3. XSS対策

- Reactの自動エスケープ機能を活用
- `dangerouslySetInnerHTML` の使用を禁止

### 4. 環境変数管理

```typescript
// config/env.ts
export const env = {
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  nominatimUrl: process.env.NEXT_PUBLIC_NOMINATIM_URL!,
} as const

// 起動時にバリデーション
if (!env.googleClientId) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required')
}
```

---

## パフォーマンス最適化

### 1. コード分割

```typescript
// 動的インポート
const MapView = dynamic(() => import('@/features/map/components/MapView'), {
  loading: () => <Loading />,
  ssr: false, // Leafletはクライアントサイドのみ
})
```

### 2. キャッシング戦略

#### a. ジオコーディングキャッシュ

```typescript
// features/geocoding/cache/GeoCache.ts
export class GeoCache {
  private cache = new Map<string, GeoPoint>()
  private storageKey = 'geo-cache'

  async get(address: string): Promise<GeoPoint | null> {
    // メモリキャッシュ
    if (this.cache.has(address)) {
      return this.cache.get(address)!
    }

    // IndexedDBキャッシュ
    const stored = await this.loadFromStorage(address)
    if (stored) {
      this.cache.set(address, stored)
      return stored
    }

    return null
  }

  async set(address: string, point: GeoPoint): Promise<void> {
    this.cache.set(address, point)
    await this.saveToStorage(address, point)
  }
}
```

#### b. APIレート制限対策

```typescript
// features/geocoding/utils/RateLimiter.ts
export class RateLimiter {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private minInterval = 1000 // 1秒

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.process()
    })
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const fn = this.queue.shift()!

    await fn()
    await new Promise(resolve => setTimeout(resolve, this.minInterval))

    this.processing = false
    this.process()
  }
}
```

### 3. 仮想化

大量のマーカーを扱う場合は、ビューポート内のみをレンダリング：

```typescript
// features/map/hooks/useVisibleMarkers.ts
export function useVisibleMarkers(markers: Marker[], bounds: LatLngBounds) {
  return useMemo(() => {
    return markers.filter(marker =>
      bounds.contains([marker.lat, marker.lng])
    )
  }, [markers, bounds])
}
```

---

## エラーハンドリング

### 1. エラー境界

```typescript
// shared/components/ErrorBoundary/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### 2. エラー型定義

```typescript
// shared/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class PDFParseError extends AppError {
  constructor(message: string) {
    super(message, 'PDF_PARSE_ERROR', 400)
  }
}

export class GeocodingError extends AppError {
  constructor(message: string) {
    super(message, 'GEOCODING_ERROR', 502)
  }
}
```

### 3. グローバルエラーハンドラー

```typescript
// shared/utils/errorHandler.ts
export function handleError(error: unknown): void {
  if (error instanceof AppError) {
    // アプリケーションエラー
    toast.error(error.message)
    logger.error(`[${error.code}] ${error.message}`)
  } else if (error instanceof Error) {
    // 予期しないエラー
    toast.error('予期しないエラーが発生しました')
    logger.error('Unexpected error:', error)
  } else {
    // 不明なエラー
    logger.error('Unknown error:', error)
  }
}
```

---

## 拡張性

### 将来の拡張ポイント

#### 1. 新しいストレージプロバイダー

```typescript
// core/storage/providers/S3Provider.ts
export class S3Provider implements IStorageProvider {
  // AWS S3 実装
}
```

インターフェースに準拠すれば、既存コードを変更せずに追加可能。

#### 2. 新しいPDFパーサー

```typescript
// features/pdf-parser/parsers/CustomParser.ts
export class CustomParser implements IPDFParser {
  // カスタム実装
}
```

#### 3. AI機能の追加

```typescript
// features/ai-summary/
├── components/
│   └── SummaryPanel.tsx
├── services/
│   └── OpenAIService.ts
└── index.ts
```

新しいフィーチャーモジュールとして追加。

---

## まとめ

PaperMapのアーキテクチャは：

- **疎結合**: 各モジュールが独立して動作
- **テスタブル**: モックによる単体テスト容易
- **拡張可能**: 新機能追加が既存コードに影響しない
- **保守性**: 明確な責務分離とドキュメント
- **スケーラブル**: 機能追加に対して柔軟に対応

これらの原則に従うことで、長期的なメンテナンスが容易で、チーム開発にも適したコードベースを実現します。
