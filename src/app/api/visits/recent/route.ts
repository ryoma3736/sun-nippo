// 最近の訪問記録 API - /api/visits/recent

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

// GET /api/visits/recent - 最近の訪問記録取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      visitDate: {
        gte: startDate,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    const visits = await prisma.visit.findMany({
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
      },
      orderBy: {
        visitDate: 'desc',
      },
      take: limit,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        visits,
        count: visits.length,
        days,
      },
    });
  } catch (error) {
    console.error('最近の訪問記録取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        visits: [],
        count: 0,
        days: 7,
      },
      message: 'デモモード: データベース未接続',
    });
  }
}
