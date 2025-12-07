// 商品マスタ API - /api/products

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Product } from '@/types';

// GET /api/products - 商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('商品一覧取得エラー:', error);
    // Return empty data for demo when database is not connected
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        products: [],
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

// POST /api/products - 商品作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: 権限チェック（管理者・マネージャーのみ）

    const product = await prisma.product.create({
      data: {
        productCode: body.productCode,
        name: body.name,
        category: body.category,
        unitPrice: body.unitPrice,
        unit: body.unit || '本',
        description: body.description,
        barcode: body.barcode,
      },
    });

    return NextResponse.json<ApiResponse<Product>>(
      {
        success: true,
        data: product,
        message: '商品を作成しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('商品作成エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '商品の作成に失敗しました',
      },
      { status: 500 }
    );
  }
}
