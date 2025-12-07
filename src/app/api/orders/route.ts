// 売上・受注記録 API - /api/orders

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, CreateOrderRequest, Order } from '@/types';

// GET /api/orders - 受注一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (userId) where.userId = userId;
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          store: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('受注記録取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        orders: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      },
      message: 'デモモード: データベース未接続',
    });
  }
}

// POST /api/orders - 受注作成
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // TODO: 認証チェック
    const userId = 'dummy-user-id';

    // 受注番号生成
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 小計計算
    const subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = body.discountAmount || (subtotal * (body.discountRate || 0)) / 100;
    const totalAmount = subtotal - discountAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        storeId: body.storeId,
        orderDate: new Date(body.orderDate),
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : new Date(),
        status: 'PENDING',
        subtotal,
        discountAmount,
        totalAmount,
        orderItems: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        store: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<Order>>(
      {
        success: true,
        data: order,
        message: '受注を作成しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('受注作成エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '受注の作成に失敗しました',
      },
      { status: 500 }
    );
  }
}

// GET /api/orders/stats - 売上統計
export async function GET_STATS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      deletedAt: null,
      status: { not: 'CANCELLED' },
    };

    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [totalSales, orderCount, avgOrderAmount] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _avg: {
          totalAmount: true,
        },
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalSales: totalSales._sum.totalAmount || 0,
        orderCount,
        avgOrderAmount: avgOrderAmount._avg.totalAmount || 0,
      },
    });
  } catch (error) {
    console.error('売上統計取得エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '売上統計の取得に失敗しました',
      },
      { status: 500 }
    );
  }
}
