'use client';

import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">📝 日報管理</h1>

          <div className="mb-6">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              今日の日報を作成
            </button>
          </div>

          <div className="border rounded-lg p-8 text-center text-gray-500">
            <p className="text-lg">日報はまだありません</p>
            <p className="text-sm mt-2">デモモード: データベース未接続</p>
          </div>
        </div>
      </div>
    </div>
  );
}
