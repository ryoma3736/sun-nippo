'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Visit } from '@/types';

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    storeId: '',
  });

  // 訪問記録一覧を取得
  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchParams.startDate) params.append('startDate', searchParams.startDate);
      if (searchParams.endDate) params.append('endDate', searchParams.endDate);
      if (searchParams.storeId) params.append('storeId', searchParams.storeId);

      const response = await fetch(`/api/visits?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVisits(data.data.visits || []);
      } else {
        setError(data.error || '訪問記録の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // 訪問記録削除
  const handleDelete = async (id: string) => {
    if (!confirm('この訪問記録を削除しますか？')) return;

    try {
      const response = await fetch(`/api/visits?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('訪問記録を削除しました');
        fetchVisits();
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (err) {
      alert('削除処理でエラーが発生しました');
      console.error('Delete error:', err);
    }
  };

  // 詳細表示
  const showDetail = (visit: Visit) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  // CSV エクスポート
  const handleExportCSV = () => {
    if (visits.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    const headers = [
      '訪問日',
      '店舗名',
      '訪問目的',
      '開始時刻',
      '終了時刻',
      '商談内容',
      '次回訪問予定日',
      '緯度',
      '経度',
    ];

    const csvRows = [
      headers.join(','),
      ...visits.map((visit: any) =>
        [
          visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('ja-JP') : '',
          visit.store?.name || '',
          visit.purpose || '',
          visit.visitStartTime ? new Date(visit.visitStartTime).toLocaleTimeString('ja-JP') : '',
          visit.visitEndTime ? new Date(visit.visitEndTime).toLocaleTimeString('ja-JP') : '',
          `"${(visit.meetingContent || '').replace(/"/g, '""')}"`,
          visit.nextVisitDate ? new Date(visit.nextVisitDate).toLocaleDateString('ja-JP') : '',
          visit.latitude || '',
          visit.longitude || '',
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `訪問記録_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 訪問目的の日本語表示
  const getPurposeLabel = (purpose: string) => {
    const labels: Record<string, string> = {
      REGULAR: '定期訪問',
      NEW_CUSTOMER: '新規開拓',
      COMPLAINT: 'クレーム対応',
      PROPOSAL: '商品提案',
      FOLLOW_UP: 'フォローアップ',
      OTHER: 'その他',
    };
    return labels[purpose] || purpose;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">📍 訪問記録</h1>

          {/* 検索・フィルタ */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="開始日"
            />
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="終了日"
            />
            <button
              onClick={fetchVisits}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              検索
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          </div>

          {/* アクションボタン */}
          <div className="mb-6">
            <Link
              href="/visits/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規訪問記録
            </Link>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* ローディング */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          )}

          {/* 訪問記録一覧 */}
          {!loading && visits.length === 0 && (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              <p className="text-lg">訪問記録はまだありません</p>
              <p className="text-sm mt-2">新規訪問記録から入力を開始してください</p>
            </div>
          )}

          {!loading && visits.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      訪問日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      店舗名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      訪問目的
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      開始時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      終了時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit: any) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.visitDate
                          ? new Date(visit.visitDate).toLocaleDateString('ja-JP')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.store?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPurposeLabel(visit.purpose)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.visitStartTime
                          ? new Date(visit.visitStartTime).toLocaleTimeString('ja-JP')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.visitEndTime
                          ? new Date(visit.visitEndTime).toLocaleTimeString('ja-JP')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => showDetail(visit)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                        <Link
                          href={`/visits/edit/${visit.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(visit.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">訪問記録詳細</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">訪問日</label>
                <p className="mt-1 text-lg">
                  {selectedVisit.visitDate
                    ? new Date(selectedVisit.visitDate).toLocaleDateString('ja-JP')
                    : '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">店舗名</label>
                <p className="mt-1 text-lg">{(selectedVisit as any).store?.name || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">訪問目的</label>
                <p className="mt-1 text-lg">{getPurposeLabel(selectedVisit.purpose)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                  <p className="mt-1">
                    {selectedVisit.startTime
                      ? new Date(selectedVisit.startTime).toLocaleTimeString('ja-JP')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                  <p className="mt-1">
                    {selectedVisit.endTime
                      ? new Date(selectedVisit.endTime).toLocaleTimeString('ja-JP')
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">商談内容</label>
                <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedVisit.content || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">次回訪問予定日</label>
                <p className="mt-1">
                  {selectedVisit.nextVisitDate
                    ? new Date(selectedVisit.nextVisitDate).toLocaleDateString('ja-JP')
                    : '-'}
                </p>
              </div>

              {(selectedVisit.latitude || selectedVisit.longitude) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">位置情報</label>
                  <p className="mt-1">
                    緯度: {selectedVisit.latitude || '-'}, 経度: {selectedVisit.longitude || '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
