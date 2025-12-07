// ユーザー登録 API - /api/auth/register

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, employeeId, phone, department } = await request.json();

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'メールアドレス、パスワード、名前は必須です',
        },
        { status: 400 }
      );
    }

    // メールアドレス重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'このメールアドレスは既に登録されています',
        },
        { status: 400 }
      );
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'SALES',
        employeeId,
        phone,
        department,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeId: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: user,
        message: 'ユーザー登録が完了しました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'ユーザー登録に失敗しました',
      },
      { status: 500 }
    );
  }
}
