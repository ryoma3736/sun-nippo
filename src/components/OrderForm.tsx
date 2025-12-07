'use client';

import { useState, useEffect } from 'react';
import type { Store, Product, CreateOrderRequest } from '@/types';

interface OrderFormProps {
  onSubmit: (order: CreateOrderRequest) => Promise<void>;
  onCancel: () => void;
}

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function OrderForm({ onSubmit, onCancel }: OrderFormProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeId: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    discountRate: 0,
    discountAmount: 0,
  });

  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);

  useEffect(() => {
    fetchStoresAndProducts();
  }, []);

  const fetchStoresAndProducts = async () => {
    try {
      const [storesRes, productsRes] = await Promise.all([
        fetch('/api/stores'),
        fetch('/api/products'),
      ]);

      if (storesRes.ok) {
        const storesData = await storesRes.json();
        setStores(storesData.data || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const addOrderItem = () => {
    if (products.length === 0) return;

    const firstProduct = products[0];
    setOrderItems([
      ...orderItems,
      {
        productId: firstProduct.id,
        productName: firstProduct.name,
        quantity: 1,
        unitPrice: firstProduct.unitPrice,
      },
    ]);
  };

  const updateOrderItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].productName = product.name;
        updated[index].unitPrice = product.unitPrice;
      }
    }

    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountAmount > 0) {
      return formData.discountAmount;
    }
    return Math.round((subtotal * formData.discountRate) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderRequest: CreateOrderRequest = {
        storeId: formData.storeId,
        orderDate: formData.orderDate,
        deliveryDate: formData.deliveryDate || undefined,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discountRate: formData.discountRate,
        discountAmount: formData.discountAmount,
      };

      await onSubmit(orderRequest);
    } catch (error) {
      console.error('受注作成エラー:', error);
      alert('受注の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">基本情報</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              店舗 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.storeId}
              onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">店舗を選択</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              受注日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">配送予定日</label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 商品明細 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">商品明細</h2>
          <button
            type="button"
            onClick={addOrderItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ＋ 商品追加
          </button>
        </div>

        <div className="space-y-3">
          {orderItems.map((item, index) => (
            <div key={index} className="flex gap-3 items-start border p-3 rounded-lg">
              <div className="flex-1">
                <select
                  value={item.productId}
                  onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ¥{product.unitPrice.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="数量"
                />
              </div>

              <div className="w-32">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateOrderItem(index, 'unitPrice', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="単価"
                />
              </div>

              <div className="w-32 py-2 text-right font-medium">
                ¥{(item.quantity * item.unitPrice).toLocaleString()}
              </div>

              <button
                type="button"
                onClick={() => removeOrderItem(index)}
                className="text-red-600 hover:text-red-800 px-3 py-2"
              >
                削除
              </button>
            </div>
          ))}

          {orderItems.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              「商品追加」ボタンをクリックして商品を追加してください
            </p>
          )}
        </div>
      </div>

      {/* 金額計算 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">金額</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">小計</span>
            <span className="text-xl">¥{calculateSubtotal().toLocaleString()}</span>
          </div>

          <div className="flex gap-4 items-center">
            <label className="font-medium">割引</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discountRate}
              onChange={(e) =>
                setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })
              }
              className="w-20 px-3 py-2 border rounded-lg"
              placeholder="0"
            />
            <span>%</span>
            <span className="mx-2">または</span>
            <input
              type="number"
              min="0"
              value={formData.discountAmount}
              onChange={(e) =>
                setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })
              }
              className="w-32 px-3 py-2 border rounded-lg"
              placeholder="0"
            />
            <span>円</span>
            <span className="ml-4 text-red-600">
              -¥{calculateDiscountAmount().toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2">
            <span className="text-xl font-bold">合計金額</span>
            <span className="text-3xl font-bold text-blue-600">
              ¥{calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || orderItems.length === 0 || !formData.storeId}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '処理中...' : '受注を登録'}
        </button>
      </div>
    </form>
  );
}
