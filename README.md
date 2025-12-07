# sun-nippo

**サントリー営業担当者向け日報アプリケーション**

営業活動（訪問記録・売上記録）を効率的に管理し、日報を自動生成するNext.js + Prisma製のWebアプリケーション。

## 🎯 主な機能

### 1. 訪問記録管理
- 店舗訪問の記録・管理
- GPS位置情報の記録
- 訪問目的の分類（定期訪問/新規開拓/クレーム対応等）
- 商談内容・提案商品の記録

### 2. 売上・受注管理
- 受注情報の入力・管理
- 商品の複数選択と数量入力
- 自動金額計算（小計・割引・合計）
- 売上統計とダッシュボード

### 3. 日報作成・提出
- 訪問・受注データの自動集約
- 活動サマリーの自動生成
- 所感・コメント入力
- 承認フロー（マネージャー承認）

### 4. マスタデータ管理
- 店舗マスタ管理
- 商品マスタ管理
- CSV一括登録対応（予定）

### 5. 認証・ユーザー管理
- JWT認証（NextAuth.js）
- ロールベースアクセス制御
  - 管理者（ADMIN）
  - マネージャー（MANAGER）
  - 営業担当（SALES）

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: (TBD - Tailwind CSS / Material-UI)

### バックエンド
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

### 開発ツール
- ESLint
- Vitest
- TypeScript Compiler

## 📦 プロジェクト構造

```
sun-nippo/
├── prisma/
│   └── schema.prisma       # データベーススキーマ定義
├── src/
│   ├── app/
│   │   └── api/            # API Routes
│   │       ├── auth/       # 認証API
│   │       ├── visits/     # 訪問記録API
│   │       ├── orders/     # 売上記録API
│   │       ├── reports/    # 日報API
│   │       ├── stores/     # 店舗マスタAPI
│   │       └── products/   # 商品マスタAPI
│   ├── lib/
│   │   └── prisma.ts       # Prisma Client
│   └── types/
│       └── index.ts        # 型定義
├── .env.local.example      # 環境変数サンプル
├── next.config.js          # Next.js設定
├── tsconfig.json           # TypeScript設定
└── package.json
```

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/ryoma3736/sun-nippo.git
cd sun-nippo
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして編集：

```bash
cp .env.local.example .env.local
```

```.env.local
DATABASE_URL="postgresql://user:password@localhost:5432/sun_nippo?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. データベースのセットアップ

```bash
# Prisma Clientの生成
npm run prisma:generate

# データベーススキーマの同期
npm run prisma:push

# または、マイグレーション実行
npm run prisma:migrate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 📊 データベーススキーマ

### 主要テーブル

- **users**: ユーザー情報
- **stores**: 店舗マスタ
- **products**: 商品マスタ
- **visits**: 訪問記録
- **orders**: 受注
- **order_items**: 受注明細
- **daily_reports**: 日報
- **report_attachments**: 日報添付ファイル
- **templates**: テンプレート
- **notifications**: 通知

詳細は `prisma/schema.prisma` を参照。

## 🔌 API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/[...nextauth]` - ログイン/ログアウト

### 訪問記録
- `GET /api/visits` - 訪問記録一覧取得
- `POST /api/visits` - 訪問記録作成

### 売上・受注
- `GET /api/orders` - 受注一覧取得
- `POST /api/orders` - 受注作成
- `GET /api/orders/stats` - 売上統計取得

### 日報
- `GET /api/reports` - 日報一覧取得
- `POST /api/reports` - 日報作成

### マスタデータ
- `GET /api/stores` - 店舗一覧取得
- `POST /api/stores` - 店舗作成
- `GET /api/products` - 商品一覧取得
- `POST /api/products` - 商品作成

## 🧪 テスト

```bash
npm test
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# 型チェック
npm run typecheck

# Linter実行
npm run lint

# Prisma Studio起動（DBビューアー）
npm run prisma:studio
```

## 📝 TODO

- [ ] フロントエンド実装（UI/UX）
- [ ] 写真添付機能
- [ ] CSV一括登録機能
- [ ] レポート・分析機能
- [ ] モバイル対応（PWA）
- [ ] 単体テスト実装
- [ ] E2Eテスト実装
- [ ] Docker対応
- [ ] CI/CD設定

## 📄 ライセンス

MIT

## 👥 コントリビューター

- [ryoma3736](https://github.com/ryoma3736)

## 📞 サポート

Issues: https://github.com/ryoma3736/sun-nippo/issues
