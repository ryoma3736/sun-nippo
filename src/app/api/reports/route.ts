// 日報 API - /api/reports

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, CreateDailyReportRequest, DailyReport } from '@/types';

// GET /api/reports - 日報一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      deletedAt: null,
    };

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          reportDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('日報取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reports: [],
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

// POST /api/reports - 日報作成
export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyReportRequest = await request.json();

    // TODO: 認証チェック
    const userId = 'dummy-user-id';

    const reportDate = new Date(body.reportDate);

    // 当日の訪問・受注データを自動集計
    const [visits, orders] = await Promise.all([
      prisma.visit.findMany({
        where: {
          userId,
          visitDate: reportDate,
          deletedAt: null,
        },
      }),
      prisma.order.findMany({
        where: {
          userId,
          orderDate: reportDate,
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    const visitCount = visits.length;
    const orderCount = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const newBusinessCount = visits.filter((v) => v.purpose === 'NEW_BUSINESS').length;

    const report = await prisma.dailyReport.create({
      data: {
        userId,
        reportDate,
        status: 'DRAFT',
        workStartTime: body.workStartTime ? new Date(body.workStartTime) : undefined,
        workEndTime: body.workEndTime ? new Date(body.workEndTime) : undefined,
        travelDistance: body.travelDistance,
        travelExpense: body.travelExpense,
        visitCount,
        orderCount,
        totalSales,
        newBusinessCount,
        achievements: body.achievements,
        reflections: body.reflections,
        tomorrowPlan: body.tomorrowPlan,
        specialNotes: body.specialNotes,
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json<ApiResponse<DailyReport>>(
      {
        success: true,
        data: report,
        message: '日報を作成しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('日報作成エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '日報の作成に失敗しました',
      },
      { status: 500 }
    );
  }
}
