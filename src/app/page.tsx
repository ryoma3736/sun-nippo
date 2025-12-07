// ホームページ - sun-nippo

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            sun-nippo
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            サントリー営業日報アプリ
          </p>
          <p className="text-lg text-gray-500">
            営業活動を効率化し、日報作成を自動化
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            icon="📍"
            title="訪問記録"
            description="店舗訪問の記録と管理。GPS位置情報も自動記録。"
          />
          <FeatureCard
            icon="💰"
            title="売上管理"
            description="受注情報の入力と集計。自動で金額計算。"
          />
          <FeatureCard
            icon="📝"
            title="日報作成"
            description="訪問・売上データを自動集約し、日報を簡単作成。"
          />
          <FeatureCard
            icon="📊"
            title="分析"
            description="売上推移や訪問件数を可視化。"
          />
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
          >
            ダッシュボードへ
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            ※ 現在はバックエンドAPIのみ実装済み
          </p>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            実装済みAPI
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/auth/register</code>
                <span className="ml-2 text-sm">- ユーザー登録</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET/POST /api/visits</code>
                <span className="ml-2 text-sm">- 訪問記録</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET/POST /api/orders</code>
                <span className="ml-2 text-sm">- 売上記録</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET/POST /api/reports</code>
                <span className="ml-2 text-sm">- 日報</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET/POST /api/stores</code>
                <span className="ml-2 text-sm">- 店舗マスタ</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET/POST /api/products</code>
                <span className="ml-2 text-sm">- 商品マスタ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
