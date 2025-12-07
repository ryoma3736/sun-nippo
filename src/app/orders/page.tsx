'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderForm from '@/components/OrderForm';
import type { Order, CreateOrderRequest, ApiResponse } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    storeId: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.storeId) params.append('storeId', filters.storeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (response.ok) {
        const data: ApiResponse = await response.json();
        setOrders(data.data?.orders || []);
      }
    } catch (error) {
      console.error('受注一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: CreateOrderRequest) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('受注を登録しました');
        setShowForm(false);
        fetchOrders();
      } else {
        throw new Error('受注登録に失敗しました');
      }
    } catch (error) {
      console.error('受注登録エラー:', error);
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('この受注を削除しますか?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('受注を削除しました');
        fetchOrders();
      } else {
        throw new Error('削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      PENDING: { label: '未確定', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">💰 新規受注入力</h1>
          </div>

          <OrderForm onSubmit={handleCreateOrder} onCancel={() => setShowForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">💰 受注管理</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              ＋ 新規受注入力
            </button>
          </div>

          {/* フィルター */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ステータス</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">すべて</option>
                <option value="PENDING">未確定</option>
                <option value="CONFIRMED">確定</option>
                <option value="CANCELLED">キャンセル</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">受注日（開始）</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">受注日（終了）</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ storeId: '', status: '', startDate: '', endDate: '' })}
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                フィルタークリア
              </button>
            </div>
          </div>

          {/* 受注一覧 */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              <p className="text-lg">受注記録はまだありません</p>
              <p className="text-sm mt-2">「新規受注入力」ボタンから受注を登録してください</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受注日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      店舗
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      合計金額
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(order as any).store?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        ¥{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          詳細
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800"
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
    </div>
  );
}
