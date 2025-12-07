# 売上・受注記録機能

## 概要

営業担当者が受注情報や売上データを記録・管理する機能です。

## 機能一覧

### 1. 受注記録入力

#### 基本情報
- 受注日
- 店舗選択
- 配送予定日

#### 受注内容
- 商品の複数選択
- 商品ごとの数量入力
- 単価の自動表示/手動調整
- 小計・合計金額の自動計算

#### 金額計算
- 割引率または割引額の入力
- リアルタイム金額計算

### 2. 受注一覧・検索

#### フィルター機能
- ステータス（未確定/確定/キャンセル）
- 受注日範囲

#### 一覧表示
- 受注番号
- 受注日
- 店舗名
- ステータス
- 合計金額
- 詳細・削除ボタン

### 3. 売上ダッシュボード

#### サマリー表示
- 本日の売上
- 今月の売上
- 今年の売上
- 目標達成率
- 平均受注額
- 残目標

#### グラフ表示
- 日別売上推移（過去30日）
- 商品カテゴリ別売上構成
- 店舗別売上ランキング（今月）
- 月別売上比較（今年 vs 去年）

## API エンドポイント

### 受注管理

```
GET    /api/orders              - 受注一覧取得
POST   /api/orders              - 受注作成
GET    /api/orders/:id          - 個別受注取得
PUT    /api/orders/:id          - 受注更新
DELETE /api/orders/:id          - 受注削除
```

### 統計・分析

```
GET    /api/orders/stats        - 売上統計データ取得
GET    /api/orders/dashboard    - ダッシュボードデータ取得
```

## データモデル

### Order（受注）

```typescript
interface Order {
  id: string;
  orderNumber: string;         // 受注番号（自動生成）
  userId: string;              // 担当者ID
  storeId: string;             // 店舗ID
  orderDate: Date;             // 受注日
  deliveryDate: Date;          // 配送予定日
  subtotal: number;            // 小計（円）
  discountAmount: number;      // 割引額（円）
  totalAmount: number;         // 合計金額（円）
  status: OrderStatus;         // ステータス
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem（受注明細）

```typescript
interface OrderItem {
  id: string;
  orderId: string;             // 受注ID
  productId: string;           // 商品ID
  quantity: number;            // 数量
  unitPrice: number;           // 単価（円）
  subtotal: number;            // 小計（円）
}
```

### OrderStatus（受注ステータス）

```typescript
enum OrderStatus {
  PENDING   // 未確定
  CONFIRMED // 確定
  CANCELLED // キャンセル
}
```

## 画面遷移

```
ダッシュボード
  ├─→ 受注管理（/orders）
  │    ├─→ 新規受注入力（モーダル/別画面）
  │    └─→ 受注詳細（/orders/:id）
  └─→ 売上ダッシュボード（/sales-dashboard）
```

## 使用方法

### 受注の作成

1. 「受注管理」ページで「新規受注入力」ボタンをクリック
2. 店舗を選択
3. 受注日を入力
4. 「商品追加」ボタンで商品を追加
5. 各商品の数量・単価を入力
6. 必要に応じて割引を設定
7. 「受注を登録」ボタンをクリック

### 受注の検索

1. 「受注管理」ページでフィルターを設定
   - ステータス
   - 受注日範囲
2. 自動的に絞り込まれた結果が表示される

### ダッシュボードの確認

1. 「売上ダッシュボード」ページを開く
2. 月間目標を設定（デフォルト：1000万円）
3. 各種グラフと統計データを確認

## テスト

```bash
# APIテストの実行
npm test tests/api/orders.test.ts

# すべてのテストを実行
npm test
```

## 実装ファイル

### API Routes
- `src/app/api/orders/route.ts` - 受注一覧・作成
- `src/app/api/orders/[id]/route.ts` - 個別受注取得・更新・削除
- `src/app/api/orders/stats/route.ts` - 売上統計
- `src/app/api/orders/dashboard/route.ts` - ダッシュボードデータ

### Pages
- `src/app/orders/page.tsx` - 受注一覧・検索
- `src/app/sales-dashboard/page.tsx` - 売上ダッシュボード

### Components
- `src/components/OrderForm.tsx` - 受注入力フォーム

### Tests
- `tests/api/orders.test.ts` - API統合テスト

## 今後の拡張予定

- [ ] 見積作成機能
- [ ] 見積から受注への変換
- [ ] 請求書PDF自動生成
- [ ] CSV/Excelエクスポート
- [ ] メール送信機能
- [ ] バーコードスキャン機能
- [ ] 過去受注からのコピー機能
