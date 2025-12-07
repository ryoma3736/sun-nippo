'use client';

import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🍶 商品マスタ</h1>

          <div className="mb-6 flex gap-4">
            <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
              新規商品登録
            </button>
            <input
              type="text"
              placeholder="商品検索..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">カテゴリ</div>
              <div className="text-2xl font-bold text-blue-600">ビール</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">カテゴリ</div>
              <div className="text-2xl font-bold text-blue-600">ハイボール</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">カテゴリ</div>
              <div className="text-2xl font-bold text-blue-600">ウイスキー</div>
            </div>
          </div>

          <div className="border rounded-lg p-8 text-center text-gray-500">
            <p className="text-lg">商品データはまだありません</p>
            <p className="text-sm mt-2">デモモード: データベース未接続</p>
          </div>
        </div>
      </div>
    </div>
  );
}
