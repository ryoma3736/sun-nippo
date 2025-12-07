// 個別受注 API - /api/orders/[id]

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Order } from '@/types';

// GET /api/orders/:id - 個別受注取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
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
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '受注が見つかりません',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: order as any,
    });
  } catch (error) {
    console.error('受注取得エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '受注の取得に失敗しました',
      },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id - 受注更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 既存の受注を確認
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '受注が見つかりません',
        },
        { status: 404 }
      );
    }

    // 金額計算
    let subtotal = existingOrder.subtotal;
    let discountAmount = body.discountAmount ?? existingOrder.discountAmount;

    if (body.items) {
      subtotal = body.items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      );
      discountAmount = body.discountAmount || (subtotal * (body.discountRate || 0)) / 100;
    }

    const totalAmount = subtotal - discountAmount;

    // トランザクションで更新
    const order = await prisma.$transaction(async (tx) => {
      // 既存の明細を削除
      if (body.items) {
        await tx.orderItem.deleteMany({
          where: { orderId: params.id },
        });
      }

      // 受注を更新
      return await tx.order.update({
        where: { id: params.id },
        data: {
          storeId: body.storeId,
          orderDate: body.orderDate ? new Date(body.orderDate) : undefined,
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
          status: body.status,
          subtotal,
          discountAmount,
          totalAmount,
          ...(body.items && {
            orderItems: {
              create: body.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
              })),
            },
          }),
        },
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
      });
    });

    return NextResponse.json<ApiResponse<Order>>({
      success: true,
      data: order as any,
      message: '受注を更新しました',
    });
  } catch (error) {
    console.error('受注更新エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '受注の更新に失敗しました',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/:id - 受注削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 受注が存在するか確認
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '受注が見つかりません',
        },
        { status: 404 }
      );
    }

    // カスケード削除（orderItemsも自動削除）
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '受注を削除しました',
    });
  } catch (error) {
    console.error('受注削除エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '受注の削除に失敗しました',
      },
      { status: 500 }
    );
  }
}
