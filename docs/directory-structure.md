# 📁 PaperMap ディレクトリ構造（疎結合設計）

## 設計方針

PaperMapは以下の原則に基づいた疎結合なアーキテクチャを採用します：

1. **レイヤー分離**: プレゼンテーション層、ビジネスロジック層、データアクセス層を明確に分離
2. **機能モジュール化**: 各機能を独立したモジュールとして実装
3. **依存性注入**: インターフェースを介した疎結合な実装
4. **テスタビリティ**: 各モジュールが独立してテスト可能
5. **拡張性**: 新機能の追加が既存コードに影響を与えない

---

## ディレクトリ構造

```
papermap/
├── .github/                      # GitHub設定
│   └── workflows/                # CI/CD設定
│       └── deploy.yml
│
├── docs/                         # プロジェクトドキュメント
│   ├── design.md                 # 設計書
│   ├── architecture.md           # アーキテクチャ詳細
│   ├── directory-structure.md    # このファイル
│   └── api/                      # API仕様書
│       ├── pdf-parser.md
│       ├── geocoding.md
│       └── storage.md
│
├── src/                          # ソースコード
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホーム画面
│   │   ├── map/
│   │   │   └── page.tsx          # 地図画面
│   │   ├── papers/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 論文詳細画面
│   │   └── api/                  # API Routes（必要に応じて）
│   │
│   ├── features/                 # 機能モジュール（Feature-First設計）
│   │   ├── upload/               # 論文アップロード機能
│   │   │   ├── components/
│   │   │   │   ├── UploadButton.tsx
│   │   │   │   └── UploadModal.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useUpload.ts
│   │   │   └── index.ts          # 公開API
│   │   │
│   │   ├── pdf-parser/           # PDF解析機能
│   │   │   ├── parsers/
│   │   │   │   ├── PyMuPDFParser.ts
│   │   │   │   └── PDFMinerParser.ts
│   │   │   ├── extractors/
│   │   │   │   ├── AuthorExtractor.ts
│   │   │   │   └── AffiliationExtractor.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── geocoding/            # ジオコーディング機能
│   │   │   ├── providers/
│   │   │   │   ├── NominatimProvider.ts
│   │   │   │   └── CacheProvider.ts
│   │   │   ├── cache/
│   │   │   │   └── GeoCache.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── map/                  # 地図表示機能
│   │   │   ├── components/
│   │   │   │   ├── MapView.tsx
│   │   │   │   ├── MapMarker.tsx
│   │   │   │   └── MarkerPopup.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMap.ts
│   │   │   │   └── useMarkers.ts
│   │   │   ├── utils/
│   │   │   │   └── mapHelpers.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── papers/               # 論文管理機能
│   │   │   ├── components/
│   │   │   │   ├── PaperCard.tsx
│   │   │   │   ├── PaperList.tsx
│   │   │   │   └── PaperDetail.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePapers.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── search/               # 検索・フィルタ機能
│   │   │   ├── components/
│   │   │   │   └── SearchBar.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSearch.ts
│   │   │   └── index.ts
│   │   │
│   │   └── auth/                 # 認証機能
│   │       ├── components/
│   │       │   └── GoogleAuthButton.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       └── index.ts
│   │
│   ├── shared/                   # 共有コンポーネント・ユーティリティ
│   │   ├── components/           # 共通UIコンポーネント
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Modal.module.css
│   │   │   └── Loading/
│   │   │       └── Loading.tsx
│   │   │
│   │   ├── hooks/                # 共通カスタムフック
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   └── utils/                # 共通ユーティリティ
│   │       ├── logger.ts
│   │       ├── errorHandler.ts
│   │       └── dateFormatter.ts
│   │
│   ├── core/                     # コアビジネスロジック
│   │   ├── storage/              # ストレージ抽象化層
│   │   │   ├── interfaces/
│   │   │   │   ├── IStorageProvider.ts
│   │   │   │   └── IPaperRepository.ts
│   │   │   ├── providers/
│   │   │   │   ├── IndexedDBProvider.ts
│   │   │   │   └── GoogleDriveProvider.ts
│   │   │   ├── repositories/
│   │   │   │   └── PaperRepository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── services/             # ビジネスロジックサービス
│   │   │   ├── PaperService.ts
│   │   │   ├── GeocodingService.ts
│   │   │   └── index.ts
│   │   │
│   │   └── models/               # ドメインモデル
│   │       ├── Paper.ts
│   │       ├── Author.ts
│   │       ├── Affiliation.ts
│   │       └── GeoPoint.ts
│   │
│   ├── config/                   # 設定ファイル
│   │   ├── app.config.ts         # アプリケーション設定
│   │   ├── api.config.ts         # API設定
│   │   └── env.ts                # 環境変数管理
│   │
│   └── types/                    # グローバル型定義
│       ├── index.ts
│       └── global.d.ts
│
├── public/                       # 静的ファイル
│   ├── icons/                    # アイコン
│   ├── images/                   # 画像
│   └── map-markers/              # 地図マーカー画像
│
├── tests/                        # テストファイル
│   ├── unit/                     # ユニットテスト
│   │   ├── features/
│   │   └── core/
│   ├── integration/              # 統合テスト
│   └── e2e/                      # E2Eテスト
│
├── scripts/                      # スクリプト
│   ├── setup.sh                  # セットアップスクリプト
│   └── build.sh                  # ビルドスクリプト
│
├── .env.example                  # 環境変数テンプレート
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js            # Tailwind CSS設定
└── README.md
```

---

## 各ディレクトリの役割

### 1. `/src/features/` - 機能モジュール

各機能を独立したモジュールとして管理します。各フィーチャーは以下の構造を持ちます：

- `components/` - 機能固有のUIコンポーネント
- `hooks/` - 機能固有のカスタムフック
- `utils/` - 機能固有のユーティリティ
- `types.ts` - 機能固有の型定義
- `index.ts` - 公開APIの定義（外部に公開する関数・コンポーネントのみエクスポート）

**メリット:**
- 機能単位でのコード管理が容易
- 機能の追加・削除が他に影響しない
- チーム開発時のコンフリクト軽減

### 2. `/src/shared/` - 共有リソース

複数の機能で使用される共通コンポーネントやユーティリティを配置します。

**原則:**
- 特定の機能に依存しない汎用的なものだけを配置
- 各コンポーネントは独立してテスト可能

### 3. `/src/core/` - コアビジネスロジック

アプリケーションの中核となるビジネスロジックを配置します。

- `storage/` - データ永続化の抽象化層
  - インターフェースを定義し、実装を差し替え可能に
  - IndexedDB、Google Drive など複数のストレージに対応
- `services/` - ドメインロジック
  - ステートレスなサービスクラス
  - 依存性注入による疎結合
- `models/` - ドメインモデル
  - ビジネスルールを持つデータ構造

**メリット:**
- UIとビジネスロジックの完全な分離
- テストが容易
- ストレージの実装を自由に変更可能

### 4. `/src/config/` - 設定管理

すべての設定を一元管理します。

```typescript
// app.config.ts
export const appConfig = {
  name: 'PaperMap',
  version: '1.0.0',
  maxUploadSize: 10 * 1024 * 1024, // 10MB
}

// api.config.ts
export const apiConfig = {
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    rateLimit: 1000, // ms
  },
}
```

---

## 依存関係のルール

依存の方向性を明確にすることで、疎結合を保ちます：

```
┌─────────────┐
│   app/      │ ← Next.jsページ（プレゼンテーション層）
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  features/  │ ← 機能モジュール
└─────┬───────┘
      │
      ├──────────┐
      │          │
      ▼          ▼
┌──────────┐ ┌──────────┐
│ shared/  │ │  core/   │ ← コアロジック・共通機能
└──────────┘ └──────────┘
```

**ルール:**
1. `app/` は `features/` を使用可能
2. `features/` は `shared/`、`core/` を使用可能
3. `shared/` と `core/` は互いに独立
4. 下位層は上位層を参照しない（逆依存の禁止）

---

## モジュール間のインターフェース例

### ストレージプロバイダーの抽象化

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
  // IndexedDB固有の実装
}

// core/storage/providers/GoogleDriveProvider.ts
export class GoogleDriveProvider implements IStorageProvider {
  // Google Drive固有の実装
}
```

これにより、ストレージの実装を自由に切り替え可能になります。

---

## テスト戦略

### ユニットテスト
- 各機能モジュールごとにテストを配置
- モックを使って依存を注入

### 統合テスト
- 複数のモジュール間の連携をテスト
- 実際のAPIやストレージを使用

### E2Eテスト
- ユーザーシナリオに基づいたテスト
- Playwright などを使用

---

## 拡張時の指針

新機能を追加する場合：

1. **新しいフィーチャーモジュールを作成**
   ```
   src/features/new-feature/
   ├── components/
   ├── hooks/
   ├── types.ts
   └── index.ts
   ```

2. **必要に応じてコアサービスを追加**
   ```
   src/core/services/NewFeatureService.ts
   ```

3. **既存のコードを変更せず、新規追加で対応**
   - Open/Closed 原則に従う
   - 既存機能への影響を最小化

4. **公開APIを明確に定義**
   - `index.ts` でエクスポートする内容を厳選
   - 内部実装の詳細は隠蔽

---

## 参考

- **Clean Architecture**: ビジネスロジックとUIの分離
- **Feature-Sliced Design**: 機能単位でのモジュール分割
- **SOLID原則**: 特に単一責任の原則と依存性逆転の原則
