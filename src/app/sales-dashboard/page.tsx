'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ApiResponse } from '@/types';

interface DashboardData {
  summary: {
    todaySales: number;
    monthSales: number;
    yearSales: number;
    todayOrders: number;
    monthOrders: number;
    targetAchievementRate: number;
  };
  dailySalesTrend: Array<{
    date: string;
    sales: number;
    orderCount: number;
  }>;
  productCategoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  storeRanking: Array<{
    storeId: string;
    storeName: string;
    totalAmount: number;
    orderCount: number;
  }>;
  monthlySalesComparison: Array<{
    month: string;
    currentYear: number;
    previousYear: number;
  }>;
}

export default function SalesDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyTarget, setMonthlyTarget] = useState(10000000); // 1000万円

  useEffect(() => {
    fetchDashboardData();
  }, [monthlyTarget]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/dashboard?target=${monthlyTarget}`);
      if (response.ok) {
        const result: ApiResponse<DashboardData> = await response.json();
        setData(result.data || null);
      }
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">データの取得に失敗しました</p>
      </div>
    );
  }

  const { summary, dailySalesTrend, productCategoryBreakdown, storeRanking, monthlySalesComparison } =
    data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">📊 売上ダッシュボード</h1>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">月間目標（円）</label>
            <input
              type="number"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 10000000)}
              className="px-4 py-2 border rounded-lg w-48"
            />
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">本日の売上</p>
            <p className="text-2xl font-bold text-blue-600">
              ¥{summary.todaySales.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.todayOrders}件</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">今月の売上</p>
            <p className="text-2xl font-bold text-green-600">
              ¥{summary.monthSales.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.monthOrders}件</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">今年の売上</p>
            <p className="text-2xl font-bold text-purple-600">
              ¥{summary.yearSales.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">目標達成率</p>
            <p className="text-2xl font-bold text-orange-600">{summary.targetAchievementRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(summary.targetAchievementRate, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">平均受注額</p>
            <p className="text-2xl font-bold text-indigo-600">
              ¥{summary.monthOrders > 0 ? Math.round(summary.monthSales / summary.monthOrders).toLocaleString() : 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">残目標</p>
            <p className="text-2xl font-bold text-red-600">
              ¥{Math.max(monthlyTarget - summary.monthSales, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 日別売上推移 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">📈 日別売上推移（過去30日）</h2>
          {dailySalesTrend.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-end justify-between gap-2 h-64">
                {dailySalesTrend.slice(-30).map((day, index) => {
                  const maxSales = Math.max(...dailySalesTrend.map((d) => d.sales));
                  const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-blue-500 w-full rounded-t hover:bg-blue-600 transition-colors relative group"
                        style={{ height: `${height}%`, minHeight: day.sales > 0 ? '4px' : '0' }}
                      >
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {day.date}
                          <br />¥{day.sales.toLocaleString()}
                          <br />
                          {day.orderCount}件
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                        {new Date(day.date).getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">データがありません</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 商品カテゴリ別売上 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">🍺 商品カテゴリ別売上</h2>
            {productCategoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {productCategoryBreakdown.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">
                        ¥{category.amount.toLocaleString()} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">データがありません</p>
            )}
          </div>

          {/* 店舗別売上ランキング */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">🏪 店舗別売上ランキング（今月）</h2>
            {storeRanking.length > 0 ? (
              <div className="space-y-3">
                {storeRanking.map((store, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                            ? 'bg-gray-300 text-gray-700'
                            : index === 2
                              ? 'bg-orange-300 text-orange-900'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{store.storeName}</p>
                      <p className="text-sm text-gray-600">{store.orderCount}件</p>
                    </div>
                    <p className="font-bold text-green-600">
                      ¥{store.totalAmount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">データがありません</p>
            )}
          </div>
        </div>

        {/* 月別売上比較 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📅 月別売上比較（今年 vs 去年）</h2>
          {monthlySalesComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-end justify-between gap-4 h-64 min-w-[800px]">
                {monthlySalesComparison.map((month, index) => {
                  const maxSales = Math.max(
                    ...monthlySalesComparison.flatMap((m) => [m.currentYear, m.previousYear])
                  );
                  const currentHeight =
                    maxSales > 0 ? (month.currentYear / maxSales) * 100 : 0;
                  const previousHeight =
                    maxSales > 0 ? (month.previousYear / maxSales) * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-1 items-end">
                        <div
                          className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                          style={{
                            height: `${currentHeight}%`,
                            minHeight: month.currentYear > 0 ? '4px' : '0',
                          }}
                          title={`今年: ¥${month.currentYear.toLocaleString()}`}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            今年<br />¥{month.currentYear.toLocaleString()}
                          </div>
                        </div>
                        <div
                          className="flex-1 bg-gray-400 rounded-t hover:bg-gray-500 transition-colors relative group"
                          style={{
                            height: `${previousHeight}%`,
                            minHeight: month.previousYear > 0 ? '4px' : '0',
                          }}
                          title={`去年: ¥${month.previousYear.toLocaleString()}`}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            去年<br />¥{month.previousYear.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{month.month}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">今年</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm">去年</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
