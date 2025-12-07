// ダッシュボード - sun-nippo

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">sun-nippo</h1>
            <div className="flex gap-4">
              <Link href="/" className="hover:underline">
                ホーム
              </Link>
              <span>ユーザー名</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">ダッシュボード</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="今日の訪問" value="0件" color="blue" />
          <StatCard title="今月の受注" value="0件" color="green" />
          <StatCard title="今月の売上" value="¥0" color="purple" />
          <StatCard title="未提出日報" value="0件" color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ActionCard
            title="訪問記録"
            description="店舗訪問を記録"
            icon="📍"
            href="/visits"
            color="blue"
          />
          <ActionCard
            title="売上入力"
            description="受注情報を入力"
            icon="💰"
            href="/orders"
            color="green"
          />
          <ActionCard
            title="日報作成"
            description="今日の日報を作成"
            icon="📝"
            href="/reports"
            color="purple"
          />
          <ActionCard
            title="マスタ管理"
            description="店舗・商品マスタ"
            icon="🏪"
            href="/master"
            color="gray"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">最近の活動</h3>
          <p className="text-gray-500 text-center py-8">
            活動履歴はまだありません
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  }[color];

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses}`}>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    gray: 'bg-gray-500 hover:bg-gray-600',
  }[color];

  return (
    <Link
      href={href}
      className={`block rounded-lg shadow-lg p-6 text-white transition-colors ${colorClasses}`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </Link>
  );
}
