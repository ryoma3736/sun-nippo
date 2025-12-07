// 売上ダッシュボード API - /api/orders/dashboard

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export interface DashboardData {
  summary: {
    todaySales: number;
    monthSales: number;
    yearSales: number;
    todayOrders: number;
    monthOrders: number;
    targetAchievementRate: number; // 目標達成率（%）
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

// GET /api/orders/dashboard - ダッシュボードデータ取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthlyTarget = parseInt(searchParams.get('target') || '10000000'); // デフォルト1000万円

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    yearEnd.setHours(23, 59, 59, 999);

    const where: any = {
      status: { not: 'CANCELLED' },
    };
    if (userId) where.userId = userId;

    // サマリー統計
    const [todayStats, monthStats, yearStats] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...where,
          orderDate: { gte: today, lt: tomorrow },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          orderDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          orderDate: { gte: yearStart, lte: yearEnd },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // 日別売上推移（過去30日）
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await prisma.$queryRaw<
      Array<{ date: Date; sales: bigint; count: bigint }>
    >`
      SELECT
        DATE(order_date) as date,
        SUM(total_amount) as sales,
        COUNT(*) as count
      FROM orders
      WHERE order_date >= ${thirtyDaysAgo}
        AND order_date <= ${today}
        AND status != 'CANCELLED'
        ${userId ? prisma.$queryRawUnsafe(`AND user_id = '${userId}'`) : prisma.$queryRawUnsafe('')}
      GROUP BY DATE(order_date)
      ORDER BY date ASC
    `.catch(() => [] as Array<{ date: Date; sales: bigint; count: bigint }>);

    // 商品カテゴリ別売上
    const categoryBreakdown = await prisma.$queryRaw<
      Array<{ category: string; amount: bigint }>
    >`
      SELECT
        p.category,
        SUM(oi.subtotal) as amount
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date >= ${monthStart}
        AND o.order_date <= ${monthEnd}
        AND o.status != 'CANCELLED'
        ${userId ? prisma.$queryRawUnsafe(`AND o.user_id = '${userId}'`) : prisma.$queryRawUnsafe('')}
      GROUP BY p.category
      ORDER BY amount DESC
    `.catch(() => [] as Array<{ category: string; amount: bigint }>);

    const totalCategorySales = categoryBreakdown.reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    // 店舗別ランキング
    const storeRanking = await prisma.order.groupBy({
      by: ['storeId'],
      where: {
        ...where,
        orderDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    const storeIds = storeRanking.map((s) => s.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true },
    });
    const storeMap = new Map(stores.map((s) => [s.id, s.name]));

    // 月別売上比較（今年 vs 去年）
    const monthlySales: Array<{
      month: number;
      year: number;
      sales: bigint;
    }> = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM order_date) as month,
        EXTRACT(YEAR FROM order_date) as year,
        SUM(total_amount) as sales
      FROM orders
      WHERE EXTRACT(YEAR FROM order_date) IN (${today.getFullYear()}, ${today.getFullYear() - 1})
        AND status != 'CANCELLED'
        ${userId ? prisma.$queryRawUnsafe(`AND user_id = '${userId}'`) : prisma.$queryRawUnsafe('')}
      GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date)
      ORDER BY year, month
    `.catch(() => []);

    const monthlyComparison = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const currentYearData = monthlySales.find(
        (m) => Number(m.year) === today.getFullYear() && Number(m.month) === month
      );
      const previousYearData = monthlySales.find(
        (m) => Number(m.year) === today.getFullYear() - 1 && Number(m.month) === month
      );

      return {
        month: `${month}月`,
        currentYear: currentYearData ? Number(currentYearData.sales) : 0,
        previousYear: previousYearData ? Number(previousYearData.sales) : 0,
      };
    });

    const dashboardData: DashboardData = {
      summary: {
        todaySales: todayStats._sum.totalAmount || 0,
        monthSales: monthStats._sum.totalAmount || 0,
        yearSales: yearStats._sum.totalAmount || 0,
        todayOrders: todayStats._count,
        monthOrders: monthStats._count,
        targetAchievementRate: Math.round(
          ((monthStats._sum.totalAmount || 0) / monthlyTarget) * 100
        ),
      },
      dailySalesTrend: dailySales.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        sales: Number(d.sales),
        orderCount: Number(d.count),
      })),
      productCategoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category || '不明',
        amount: Number(c.amount),
        percentage:
          totalCategorySales > 0
            ? Math.round((Number(c.amount) / totalCategorySales) * 100)
            : 0,
      })),
      storeRanking: storeRanking.map((s) => ({
        storeId: s.storeId,
        storeName: storeMap.get(s.storeId) || '不明',
        totalAmount: s._sum.totalAmount || 0,
        orderCount: s._count,
      })),
      monthlySalesComparison: monthlyComparison,
    };

    return NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('ダッシュボードデータ取得エラー:', error);
    // デモデータを返す
    return NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: {
        summary: {
          todaySales: 0,
          monthSales: 0,
          yearSales: 0,
          todayOrders: 0,
          monthOrders: 0,
          targetAchievementRate: 0,
        },
        dailySalesTrend: [],
        productCategoryBreakdown: [],
        storeRanking: [],
        monthlySalesComparison: [],
      },
      message: 'デモモード: データベース未接続',
    });
  }
}
