// 店舗マスタ API - /api/stores

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Store } from '@/types';

// GET /api/stores - 店舗一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const businessType = searchParams.get('businessType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { storeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (businessType) {
      where.businessType = businessType;
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        stores,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('店舗一覧取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        stores: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
      },
      message: 'デモモード: データベース未接続',
    });
  }
}

// POST /api/stores - 店舗作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: 権限チェック（管理者・マネージャーのみ）
    const userId = 'dummy-user-id';

    const store = await prisma.store.create({
      data: {
        name: body.name,
        nameKana: body.nameKana,
        storeCode: body.storeCode,
        postalCode: body.postalCode,
        address: body.address,
        phone: body.phone,
        businessType: body.businessType,
        contactPerson: body.contactPerson,
        latitude: body.latitude,
        longitude: body.longitude,
        notes: body.notes,
        createdById: userId,
      },
    });

    return NextResponse.json<ApiResponse<Store>>(
      {
        success: true,
        data: store,
        message: '店舗を作成しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('店舗作成エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '店舗の作成に失敗しました',
      },
      { status: 500 }
    );
  }
}
