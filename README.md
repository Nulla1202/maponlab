# 📍 PaperMap

**論文から「知の地図」を描く**

PaperMapは、研究論文の著者所属機関を自動解析し、世界地図上に可視化するWebアプリケーションです。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)

---

## 🎯 コンセプト

研究論文をアップロードするだけで：

1. PDFから著者情報と所属機関を自動抽出
2. 機関名を緯度経度に変換
3. 世界地図上にピンを表示
4. クリックで著者・論文情報を閲覧

→ 「この研究はどこから発信されたのか」を直感的に把握できます。

---

## ✨ 主な機能

- 📤 **論文アップロード**: PDFファイルをドラッグ&ドロップ
- 🔍 **自動解析**: 著者名・所属機関を自動抽出
- 🗺️ **地図可視化**: OpenStreetMapベースの世界地図表示
- 📌 **インタラクティブピン**: クリックで詳細情報表示
- 💾 **データ保存**: IndexedDB / Google Drive に対応
- 🔐 **Google認証**: OAuth 2.0による安全なログイン
- 🔎 **検索・フィルタ**: 著者名・国名での絞り込み（Phase 2）

---

## 🏗️ アーキテクチャ

### 設計原則

PaperMapは **疎結合・高保守性** を重視した設計を採用しています：

- ✅ **Clean Architecture**: ビジネスロジックとUIの完全分離
- ✅ **Feature-Sliced Design**: 機能単位でのモジュール分割
- ✅ **依存性注入**: インターフェース経由の疎結合
- ✅ **SOLID原則**: 拡張性と保守性を確保

詳細は以下のドキュメントをご覧ください：

- [設計書](./docs/design.md) - プロジェクト概要とMVP仕様
- [アーキテクチャ](./docs/architecture.md) - 技術的な詳細設計
- [ディレクトリ構造](./docs/directory-structure.md) - 疎結合な構造の解説

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 18, Next.js 14, TypeScript 5 |
| スタイリング | Tailwind CSS |
| 地図表示 | Leaflet.js, React-Leaflet |
| PDF解析 | PyMuPDF (WASM), pdf.js |
| ストレージ | IndexedDB, Google Drive API |
| 認証 | Google OAuth 2.0 |
| ジオコーディング | Nominatim API (OpenStreetMap) |
| テスト | Jest, Playwright |
| デプロイ | Vercel / Cloudflare Pages |

---

## 🚀 セットアップ

### 必要な環境

- Node.js 18.x 以上
- npm or yarn or pnpm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/papermap.git
cd papermap

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して必要なAPIキーを設定
```

### 環境変数

`.env.local` に以下を設定してください：

```env
# Google OAuth 2.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here

# Nominatim API（デフォルトでOK）
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

### 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` でアプリが起動します。

---

## 📂 プロジェクト構造

```
papermap/
├── docs/                    # ドキュメント
│   ├── design.md            # 設計書
│   ├── architecture.md      # アーキテクチャ
│   └── directory-structure.md
│
├── src/
│   ├── app/                 # Next.js App Router
│   ├── features/            # 機能モジュール
│   │   ├── upload/          # 論文アップロード
│   │   ├── pdf-parser/      # PDF解析
│   │   ├── geocoding/       # ジオコーディング
│   │   ├── map/             # 地図表示
│   │   └── papers/          # 論文管理
│   ├── core/                # コアビジネスロジック
│   │   ├── models/          # ドメインモデル
│   │   ├── services/        # サービス層
│   │   └── storage/         # ストレージ抽象化
│   └── shared/              # 共有リソース
│
├── tests/                   # テスト
└── public/                  # 静的ファイル
```

詳細は [ディレクトリ構造ドキュメント](./docs/directory-structure.md) をご覧ください。

---

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

---

## 🛠️ 開発ガイドライン

### コーディング規約

- **TypeScript**: 厳格なモードで型安全性を確保
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット自動化

```bash
# リント
npm run lint

# フォーマット
npm run format
```

### 新機能の追加

1. `src/features/` に新しい機能モジュールを作成
2. 公開APIを `index.ts` で定義
3. テストを書く
4. ドキュメントを更新

詳細は [アーキテクチャドキュメント](./docs/architecture.md) の「拡張性」セクションを参照してください。

---

## 📊 ロードマップ

### Phase 1: MVP（現在）

- [x] 設計書の作成
- [x] アーキテクチャ設計
- [ ] UIモックアップ
- [ ] 基本機能実装

### Phase 2: 機能拡張

- [ ] 検索・フィルタ機能
- [ ] 統計ダッシュボード
- [ ] AI自動要約（OpenAI API）

### Phase 3: コラボレーション

- [ ] ユーザー間でのマップ共有
- [ ] 被引用ネットワークの可視化
- [ ] 分野別フィルタリング

---

## 💡 コストパフォーマンス

PaperMapは **完全無料** で運用可能です：

| 項目 | 費用 |
|------|------|
| ストレージ | ¥0（Google Drive無料枠） |
| PDF解析 | ¥0（クライアント側処理） |
| 地図表示 | ¥0（OpenStreetMap） |
| ジオコーディング | ¥0（Nominatim API） |
| ホスティング | ¥0（Vercel/Cloudflare無料枠） |
| **合計** | **¥0〜¥200/月** |

---

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap Nominatim](https://nominatim.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Built with ❤️ by PaperMap Team**
