import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, rememberMe } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Le nom d\'utilisateur et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Generate access token
    const accessToken = await signToken(
      { userId: user.id, username: user.username },
      '15m'
    );

    // Generate refresh token
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    const refreshToken = await signToken(
      { userId: user.id, type: 'refresh' },
      refreshTokenExpiry
    );
    const refreshTokenHash = Buffer.from(refreshToken).toString('base64');

    // Update refresh token hash
    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    // Set refresh token cookie
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            xp: user.xp,
            level: user.level,
            streakCurrent: user.streakCurrent,
            streakBest: user.streakBest,
            lastActivityDate: user.lastActivityDate,
            achievements: JSON.parse(user.achievements),
            preferences: JSON.parse(user.preferences),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken,
        },
      },
      { status: 200 }
    );

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
