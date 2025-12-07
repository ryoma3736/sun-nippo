// 訪問記録 API - /api/visits

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, CreateVisitRequest, Visit } from '@/types';

// GET /api/visits - 訪問記録一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      deletedAt: null,
    };

    if (userId) where.userId = userId;
    if (storeId) where.storeId = storeId;
    if (startDate || endDate) {
      where.visitDate = {};
      if (startDate) where.visitDate.gte = new Date(startDate);
      if (endDate) where.visitDate.lte = new Date(endDate);
    }

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        include: {
          store: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          visitDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visit.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        visits,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('訪問記録取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        visits: [],
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

// POST /api/visits - 訪問記録作成
export async function POST(request: NextRequest) {
  try {
    const body: CreateVisitRequest = await request.json();

    // TODO: 認証チェック（NextAuthから取得）
    const userId = 'dummy-user-id'; // 実際はセッションから取得

    const visit = await prisma.visit.create({
      data: {
        userId,
        storeId: body.storeId,
        visitDate: new Date(body.visitDate),
        visitStartTime: body.startTime ? new Date(body.startTime) : undefined,
        visitEndTime: body.endTime ? new Date(body.endTime) : undefined,
        purpose: body.purpose,
        meetingContent: body.content,
        nextVisitDate: body.nextVisitDate ? new Date(body.nextVisitDate) : undefined,
        latitude: body.latitude,
        longitude: body.longitude,
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
      },
    });

    return NextResponse.json<ApiResponse<Visit>>(
      {
        success: true,
        data: visit,
        message: '訪問記録を作成しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('訪問記録作成エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '訪問記録の作成に失敗しました',
      },
      { status: 500 }
    );
  }
}

// PUT /api/visits - 訪問記録更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '訪問記録IDが必要です',
        },
        { status: 400 }
      );
    }

    // TODO: 権限チェック（自分の訪問記録または管理者のみ）
    const userId = 'dummy-user-id';

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        storeId: updateData.storeId,
        visitDate: updateData.visitDate ? new Date(updateData.visitDate) : undefined,
        visitStartTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        visitEndTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        purpose: updateData.purpose,
        meetingContent: updateData.content,
        competitorInfo: updateData.competitorInfo,
        storeCondition: updateData.storeCondition,
        nextVisitDate: updateData.nextVisitDate ? new Date(updateData.nextVisitDate) : undefined,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
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
      },
    });

    return NextResponse.json<ApiResponse<Visit>>({
      success: true,
      data: visit,
      message: '訪問記録を更新しました',
    });
  } catch (error) {
    console.error('訪問記録更新エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '訪問記録の更新に失敗しました',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/visits - 訪問記録削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '訪問記録IDが必要です',
        },
        { status: 400 }
      );
    }

    // TODO: 権限チェック（自分の訪問記録または管理者のみ）
    const userId = 'dummy-user-id';

    await prisma.visit.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '訪問記録を削除しました',
    });
  } catch (error) {
    console.error('訪問記録削除エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '訪問記録の削除に失敗しました',
      },
      { status: 500 }
    );
  }
}
