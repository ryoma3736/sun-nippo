// 売上統計 API - /api/orders/stats

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export interface OrderStats {
  totalSales: number;
  orderCount: number;
  avgOrderAmount: number;
  todaySales: number;
  monthSales: number;
  yearSales: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
  }>;
  topStores: Array<{
    storeId: string;
    storeName: string;
    orderCount: number;
    totalAmount: number;
  }>;
}

// GET /api/orders/stats - 売上統計取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      status: { not: 'CANCELLED' },
    };

    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    // 今日の日付範囲
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 今月の日付範囲
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // 今年の日付範囲
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    yearEnd.setHours(23, 59, 59, 999);

    // 集計クエリ
    const [totalStats, todayStats, monthStats, yearStats, productStats, storeStats] =
      await Promise.all([
        // 全体統計
        prisma.order.aggregate({
          where,
          _sum: { totalAmount: true },
          _count: true,
          _avg: { totalAmount: true },
        }),

        // 今日の売上
        prisma.order.aggregate({
          where: {
            ...where,
            orderDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          _sum: { totalAmount: true },
        }),

        // 今月の売上
        prisma.order.aggregate({
          where: {
            ...where,
            orderDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { totalAmount: true },
        }),

        // 今年の売上
        prisma.order.aggregate({
          where: {
            ...where,
            orderDate: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
          _sum: { totalAmount: true },
        }),

        // 商品別売上
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: where,
          },
          _sum: {
            quantity: true,
            subtotal: true,
          },
          orderBy: {
            _sum: {
              subtotal: 'desc',
            },
          },
          take: 10,
        }),

        // 店舗別売上
        prisma.order.groupBy({
          by: ['storeId'],
          where,
          _count: true,
          _sum: {
            totalAmount: true,
          },
          orderBy: {
            _sum: {
              totalAmount: 'desc',
            },
          },
          take: 10,
        }),
      ]);

    // 商品詳細取得
    const productIds = productStats.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    // 店舗詳細取得
    const storeIds = storeStats.map((s) => s.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true },
    });

    const storeMap = new Map(stores.map((s) => [s.id, s.name]));

    const stats: OrderStats = {
      totalSales: totalStats._sum.totalAmount || 0,
      orderCount: totalStats._count,
      avgOrderAmount: Math.round(totalStats._avg.totalAmount || 0),
      todaySales: todayStats._sum.totalAmount || 0,
      monthSales: monthStats._sum.totalAmount || 0,
      yearSales: yearStats._sum.totalAmount || 0,
      topProducts: productStats.map((p) => ({
        productId: p.productId,
        productName: productMap.get(p.productId) || '不明',
        totalQuantity: p._sum.quantity || 0,
        totalAmount: p._sum.subtotal || 0,
      })),
      topStores: storeStats.map((s) => ({
        storeId: s.storeId,
        storeName: storeMap.get(s.storeId) || '不明',
        orderCount: s._count,
        totalAmount: s._sum.totalAmount || 0,
      })),
    };

    return NextResponse.json<ApiResponse<OrderStats>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('売上統計取得エラー:', error);
    // デモデータを返す
    return NextResponse.json<ApiResponse<OrderStats>>({
      success: true,
      data: {
        totalSales: 0,
        orderCount: 0,
        avgOrderAmount: 0,
        todaySales: 0,
        monthSales: 0,
        yearSales: 0,
        topProducts: [],
        topStores: [],
      },
      message: 'デモモード: データベース未接続',
    });
  }
}
