# 技術アーキテクチャ設計書 - サントリー営業日報アプリ

**プロジェクト名**: sun-nippo
**バージョン**: 1.0.0
**作成日**: 2025-12-07

---

## 📐 システムアーキテクチャ

### 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          Next.js 14 (App Router + RSC)                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │   Pages  │  │Components│  │ Contexts │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Next.js API Routes                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │   Auth   │  │   CRUD   │  │  Logic   │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  │                                                        │  │
│  │            Prisma ORM (Type-safe Query)               │  │
│  └────────────────────────────┬───────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL 15                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │  Users   │  │  Visits  │  │  Orders  │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  │  ┌──────────┐  ┌──────────┐                           │  │
│  │  │  Reports │  │  Masters │                           │  │
│  │  └──────────┘  └──────────┘                           │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ レイヤー設計

### 1. プレゼンテーション層（Frontend）

#### 技術スタック
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: Tailwind CSS 3.x
- **State Management**: React Context API / Zustand（検討中）
- **Form Handling**: React Hook Form
- **Validation**: Zod

#### ディレクトリ構成
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # 認証関連ページ（グループ）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/          # ダッシュボード（グループ）
│   │   ├── page.tsx
│   │   ├── visits/           # 訪問記録
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── orders/           # 受注
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── reports/          # 日報
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── stores/           # 店舗マスタ
│   │   │   └── page.tsx
│   │   ├── products/         # 商品マスタ
│   │   │   └── page.tsx
│   │   └── layout.tsx        # ダッシュボード共通レイアウト
│   ├── api/                  # API Routes
│   │   ├── auth/
│   │   ├── visits/
│   │   ├── orders/
│   │   ├── reports/
│   │   ├── stores/
│   │   └── products/
│   ├── layout.tsx            # ルートレイアウト
│   └── globals.css           # グローバルCSS
├── components/               # Reactコンポーネント
│   ├── ui/                   # 再利用可能なUIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/               # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── features/             # 機能別コンポーネント
│   │   ├── visits/
│   │   │   ├── VisitForm.tsx
│   │   │   ├── VisitList.tsx
│   │   │   └── VisitCard.tsx
│   │   ├── orders/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderList.tsx
│   │   │   └── OrderItemRow.tsx
│   │   └── reports/
│   │       ├── ReportForm.tsx
│   │       ├── ReportList.tsx
│   │       └── ReportSummary.tsx
│   └── providers/            # Context Providers
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
├── lib/                      # ユーティリティ・ヘルパー
│   ├── prisma.ts             # Prisma Client
│   ├── auth.ts               # NextAuth設定
│   ├── validations.ts        # Zodスキーマ
│   └── utils.ts              # 汎用ユーティリティ
├── types/                    # TypeScript型定義
│   ├── api.ts
│   ├── models.ts
│   └── index.ts
└── hooks/                    # カスタムReact Hooks
    ├── useAuth.ts
    ├── useVisits.ts
    ├── useOrders.ts
    └── useReports.ts
```

---

### 2. アプリケーション層（Backend）

#### Next.js API Routes設計

**RESTful API設計原則**:
- リソース指向のURL設計
- HTTPメソッドの適切な使用（GET, POST, PUT, DELETE）
- ステータスコードの統一（200, 201, 400, 401, 404, 500）
- エラーレスポンスの標準化

#### API エンドポイント設計

##### 認証API (`/api/auth/*`)
```typescript
// NextAuth.js標準エンドポイント
POST   /api/auth/signin        // ログイン
POST   /api/auth/signout       // ログアウト
GET    /api/auth/session       // セッション取得
GET    /api/auth/csrf          // CSRFトークン取得

// カスタムエンドポイント
POST   /api/auth/register      // ユーザー登録（ADMIN専用）
```

##### 訪問記録API (`/api/visits/*`)
```typescript
GET    /api/visits             // 訪問記録一覧取得
POST   /api/visits             // 訪問記録作成
GET    /api/visits/:id         // 訪問記録詳細取得
PUT    /api/visits/:id         // 訪問記録更新
DELETE /api/visits/:id         // 訪問記録削除
```

##### 受注API (`/api/orders/*`)
```typescript
GET    /api/orders             // 受注一覧取得
POST   /api/orders             // 受注作成
GET    /api/orders/:id         // 受注詳細取得
PUT    /api/orders/:id         // 受注更新
DELETE /api/orders/:id         // 受注削除
GET    /api/orders/stats       // 売上統計取得
```

##### 日報API (`/api/reports/*`)
```typescript
GET    /api/reports            // 日報一覧取得
POST   /api/reports            // 日報作成
GET    /api/reports/:id        // 日報詳細取得
PUT    /api/reports/:id        // 日報更新
POST   /api/reports/:id/submit // 日報提出
POST   /api/reports/:id/approve // 日報承認（MANAGER専用）
POST   /api/reports/:id/reject  // 日報差し戻し（MANAGER専用）
GET    /api/reports/generate   // 日報自動生成（当日データ集約）
```

##### 店舗マスタAPI (`/api/stores/*`)
```typescript
GET    /api/stores             // 店舗一覧取得
POST   /api/stores             // 店舗作成（MANAGER, ADMIN専用）
GET    /api/stores/:id         // 店舗詳細取得
PUT    /api/stores/:id         // 店舗更新（MANAGER, ADMIN専用）
DELETE /api/stores/:id         // 店舗削除（ADMIN専用）
```

##### 商品マスタAPI (`/api/products/*`)
```typescript
GET    /api/products           // 商品一覧取得
POST   /api/products           // 商品作成（MANAGER, ADMIN専用）
GET    /api/products/:id       // 商品詳細取得
PUT    /api/products/:id       // 商品更新（MANAGER, ADMIN専用）
DELETE /api/products/:id       // 商品削除（ADMIN専用）
```

#### APIレスポンス形式

**成功レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Example"
  },
  "message": "操作が正常に完了しました"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  }
}
```

---

### 3. データアクセス層（Prisma ORM）

#### Prisma設定

**prisma/schema.prisma**:
- 型安全なクエリ生成
- マイグレーション管理
- リレーションの自動解決
- トランザクション対応

#### データアクセスパターン

**リポジトリパターン（検討中）**:
```typescript
// lib/repositories/visitRepository.ts
import { prisma } from '@/lib/prisma';
import type { Visit, Prisma } from '@prisma/client';

export class VisitRepository {
  async findMany(userId: string, filters?: VisitFilters) {
    return prisma.visit.findMany({
      where: {
        userId,
        visitDate: filters?.dateRange ? {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to
        } : undefined
      },
      include: {
        store: true,
        visitProducts: {
          include: { product: true }
        }
      },
      orderBy: { visitDate: 'desc' }
    });
  }

  async create(data: Prisma.VisitCreateInput) {
    return prisma.visit.create({ data });
  }

  // ... その他のメソッド
}
```

---

### 4. データベース層（PostgreSQL）

#### スキーマ設計原則
- 正規化（第3正規形）
- インデックス最適化（頻繁に検索される列）
- 論理削除の採用（`isActive`フラグ）
- タイムスタンプ管理（`createdAt`, `updatedAt`）

#### インデックス戦略
```sql
-- 訪問記録
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_store_id ON visits(store_id);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);

-- 受注
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- 日報
CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE UNIQUE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date);
```

#### パフォーマンス最適化
- コネクションプーリング（Prisma内蔵）
- クエリ最適化（N+1問題回避）
- 適切なリレーション設定（Cascade, Restrict）

---

## 🔐 セキュリティ設計

### 認証・認可

#### NextAuth.js設定
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.lastName} ${user.firstName}`,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24時間
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
};
```

#### ロールベースアクセス制御（RBAC）
```typescript
// lib/rbac.ts
export enum UserRole {
  SALES = 'SALES',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export const permissions = {
  visits: {
    create: [UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN],
    read: [UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN],
    update: [UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN], // 自分のみ
    delete: [UserRole.ADMIN]
  },
  reports: {
    approve: [UserRole.MANAGER, UserRole.ADMIN],
    reject: [UserRole.MANAGER, UserRole.ADMIN]
  },
  masters: {
    manage: [UserRole.MANAGER, UserRole.ADMIN]
  },
  users: {
    manage: [UserRole.ADMIN]
  }
};

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const allowedRoles = permissions[resource]?.[action] || [];
  return allowedRoles.includes(userRole);
}
```

### セキュリティ対策

| 脅威 | 対策 | 実装方法 |
|------|------|---------|
| XSS | 自動エスケープ | React標準機能 + CSPヘッダー |
| CSRF | トークン検証 | NextAuth.js標準機能 |
| SQLインジェクション | パラメータバインディング | Prisma ORM |
| 認証情報漏洩 | パスワードハッシュ化 | bcrypt (salt rounds: 10) |
| セッション固定 | セッション再生成 | NextAuth.js標準機能 |
| ブルートフォース | レート制限（Phase 2） | next-rate-limit |

---

## 📊 データフロー設計

### 訪問記録作成フロー

```
[ユーザー]
    │
    │ 1. フォーム入力
    ▼
[VisitForm Component]
    │
    │ 2. バリデーション（Zod）
    ▼
[API: POST /api/visits]
    │
    │ 3. 認証チェック（NextAuth）
    │ 4. 権限チェック（RBAC）
    ▼
[Prisma ORM]
    │
    │ 5. トランザクション開始
    │ 6. Visit作成
    │ 7. VisitProduct関連付け
    │ 8. トランザクションコミット
    ▼
[PostgreSQL]
    │
    │ 9. データ永続化
    ▼
[API Response]
    │
    │ 10. 成功レスポンス
    ▼
[VisitForm Component]
    │
    │ 11. 一覧画面へリダイレクト
    ▼
[VisitList Component]
```

### 日報自動生成フロー

```
[ユーザー]
    │
    │ 1. 日報作成画面アクセス
    ▼
[ReportForm Component]
    │
    │ 2. 自動生成API呼び出し
    ▼
[API: GET /api/reports/generate?date=2025-12-07]
    │
    │ 3. 当日の訪問記録取得
    │ 4. 当日の受注取得
    │ 5. 統計計算（件数、金額、時間）
    ▼
[自動生成ロジック]
    │
    │ 6. サマリー文生成
    │ 7. 訪問先リスト作成
    ▼
[API Response]
    │
    │ 8. 生成データ返却
    ▼
[ReportForm Component]
    │
    │ 9. フォームに自動入力
    │ 10. ユーザーが所感を追記
    │ 11. 提出
    ▼
[API: POST /api/reports]
```

---

## 🚀 デプロイメント設計

### 推奨インフラ構成

#### Option A: Vercel + Supabase（推奨）

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend + API)       │
│  - Next.js App                          │
│  - Serverless Functions                │
│  - Edge Network (CDN)                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Supabase                      │
│  - PostgreSQL Database                  │
│  - Connection Pooling                   │
│  - Automatic Backups                    │
└─────────────────────────────────────────┘
```

**メリット**:
- フロントエンドとバックエンドの統合デプロイ
- 自動スケーリング
- CDNによる高速配信
- 無料枠が充実

#### Option B: AWS（スケーラブル構成）

```
┌─────────────────────────────────────────┐
│           CloudFront (CDN)              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           EC2 / ECS (Next.js App)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           RDS (PostgreSQL)              │
│  - Multi-AZ                             │
│  - Automated Backups                    │
└─────────────────────────────────────────┘
```

### 環境変数管理

**必須環境変数**:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/sun_nippo"

# NextAuth
NEXTAUTH_URL="https://sun-nippo.example.com"
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"

# Optional (Phase 2)
AWS_S3_BUCKET="sun-nippo-attachments"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
```

---

## 📈 監視・ロギング設計

### ログレベル定義

| レベル | 用途 | 例 |
|--------|------|---|
| ERROR | エラー発生時 | DB接続失敗、API呼び出しエラー |
| WARN | 警告事項 | 認証失敗、バリデーションエラー |
| INFO | 主要な処理 | ユーザーログイン、日報提出 |
| DEBUG | デバッグ情報 | クエリ実行、パラメータ値 |

### 監視項目

- **パフォーマンス**: API応答時間、DBクエリ実行時間
- **可用性**: アップタイム、エラー率
- **ビジネスメトリクス**: 日報提出数、訪問件数、売上合計

---

## 🧪 テスト戦略

### テストピラミッド

```
       ┌──────────┐
       │   E2E    │  10%
       └──────────┘
      ┌────────────┐
      │ Integration│  30%
      └────────────┘
     ┌──────────────┐
     │  Unit Tests  │  60%
     └──────────────┘
```

### テスト実装

**ユニットテスト（Vitest）**:
```typescript
// __tests__/lib/validations.test.ts
import { describe, it, expect } from 'vitest';
import { visitSchema } from '@/lib/validations';

describe('visitSchema', () => {
  it('valid dataでvalidation成功', () => {
    const validData = {
      userId: 'user123',
      storeId: 'store456',
      visitDate: new Date('2025-12-07'),
      purpose: 'REGULAR'
    };
    expect(() => visitSchema.parse(validData)).not.toThrow();
  });

  it('必須項目が欠けている場合エラー', () => {
    const invalidData = {
      userId: 'user123'
    };
    expect(() => visitSchema.parse(invalidData)).toThrow();
  });
});
```

**統合テスト（API Routes）**:
```typescript
// __tests__/api/visits.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/visits/route';

describe('/api/visits', () => {
  it('GET: 訪問記録一覧を取得', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toHaveProperty('data');
  });
});
```

**E2Eテスト（Playwright - Phase 2）**:
```typescript
import { test, expect } from '@playwright/test';

test('訪問記録作成フロー', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.goto('/visits/new');
  await page.selectOption('select[name="storeId"]', 'store123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/visits');
});
```

---

## 📦 ビルド・デプロイフロー

### CI/CD パイプライン

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔄 今後の拡張性

### Phase 2拡張計画

- **写真添付機能**: AWS S3 + CloudFront
- **メール通知**: SendGrid / AWS SES
- **CSV一括登録**: Papa Parse + Batch処理
- **高度な分析**: Chart.js / Recharts
- **PWA化**: Service Worker + Manifest

### スケーラビリティ対策

- **データベース**: Read Replica追加、パーティショニング
- **キャッシング**: Redis導入（セッション、頻繁なクエリ）
- **CDN**: 静的アセットの配信最適化
- **API**: GraphQL導入検討（複雑なクエリ最適化）

---

**作成者**: CodeGenAgent (源)
**バージョン**: 1.0.0
