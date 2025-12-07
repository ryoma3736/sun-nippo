'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Store, VisitPurpose } from '@/types';

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeId: '',
    visitDate: '',
    startTime: '',
    endTime: '',
    purpose: 'REGULAR' as VisitPurpose,
    content: '',
    competitorInfo: '',
    storeCondition: '',
    nextVisitDate: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // 店舗一覧と訪問記録を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 店舗一覧取得
        const storesResponse = await fetch('/api/stores');
        const storesData = await storesResponse.json();
        if (storesData.success) {
          setStores(storesData.data.stores || []);
        }

        // 訪問記録取得
        const visitResponse = await fetch(`/api/visits?id=${visitId}`);
        const visitData = await visitResponse.json();

        if (visitData.success && visitData.data.visits?.length > 0) {
          const visit = visitData.data.visits[0];
          const visitDate = new Date(visit.visitDate).toISOString().split('T')[0];
          const startTime = visit.visitStartTime
            ? new Date(visit.visitStartTime).toTimeString().slice(0, 5)
            : '';
          const endTime = visit.visitEndTime
            ? new Date(visit.visitEndTime).toTimeString().slice(0, 5)
            : '';
          const nextVisitDate = visit.nextVisitDate
            ? new Date(visit.nextVisitDate).toISOString().split('T')[0]
            : '';

          setFormData({
            storeId: visit.storeId,
            visitDate,
            startTime,
            endTime,
            purpose: visit.purpose,
            content: visit.meetingContent || '',
            competitorInfo: visit.competitorInfo || '',
            storeCondition: visit.storeCondition || '',
            nextVisitDate,
            latitude: visit.latitude,
            longitude: visit.longitude,
          });
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        alert('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (visitId) {
      fetchData();
    }
  }, [visitId]);

  // GPS位置情報を取得
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報機能をサポートしていません');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsLoading(false);
        alert('位置情報を取得しました');
      },
      (error) => {
        console.error('GPS取得エラー:', error);
        alert('位置情報の取得に失敗しました');
        setGpsLoading(false);
      }
    );
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeId) {
      alert('店舗を選択してください');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/visits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: visitId,
          storeId: formData.storeId,
          visitDate: formData.visitDate,
          startTime: `${formData.visitDate}T${formData.startTime}:00`,
          endTime: formData.endTime ? `${formData.visitDate}T${formData.endTime}:00` : undefined,
          purpose: formData.purpose,
          content: formData.content,
          competitorInfo: formData.competitorInfo,
          storeCondition: formData.storeCondition,
          nextVisitDate: formData.nextVisitDate || undefined,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('訪問記録を更新しました');
        router.push('/visits');
      } else {
        alert(data.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('ネットワークエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/visits" className="text-blue-600 hover:text-blue-800">
            ← 訪問記録一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">訪問記録編集</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 店舗選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                店舗 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">店舗を選択してください</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.address}
                  </option>
                ))}
              </select>
            </div>

            {/* 訪問日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                訪問日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 訪問時刻 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時刻 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了時刻</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 訪問目的 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                訪問目的 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value as VisitPurpose })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="REGULAR">定期訪問</option>
                <option value="NEW_CUSTOMER">新規開拓</option>
                <option value="COMPLAINT">クレーム対応</option>
                <option value="PROPOSAL">商品提案</option>
                <option value="FOLLOW_UP">フォローアップ</option>
                <option value="OTHER">その他</option>
              </select>
            </div>

            {/* 商談内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商談内容</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="商談内容を入力してください..."
              />
            </div>

            {/* 競合情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">競合情報</label>
              <textarea
                value={formData.competitorInfo}
                onChange={(e) => setFormData({ ...formData, competitorInfo: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="競合他社の動向などを入力..."
              />
            </div>

            {/* 店舗状況 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">店舗状況</label>
              <textarea
                value={formData.storeCondition}
                onChange={(e) => setFormData({ ...formData, storeCondition: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="店舗の状況、気づいた点など..."
              />
            </div>

            {/* 次回訪問予定日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                次回訪問予定日
              </label>
              <input
                type="date"
                value={formData.nextVisitDate}
                onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GPS位置情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                位置情報（任意）
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {gpsLoading ? '取得中...' : '現在位置を取得'}
                </button>
                {formData.latitude && formData.longitude && (
                  <span className="text-sm text-gray-600">
                    緯度: {formData.latitude.toFixed(6)}, 経度: {formData.longitude.toFixed(6)}
                  </span>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? '更新中...' : '更新'}
              </button>
              <Link
                href="/visits"
                className="flex-1 text-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
