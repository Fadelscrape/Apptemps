import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, signToken } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Aucun refresh token' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { success: false, error: 'Refresh token invalide' },
        { status: 401 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Verify refresh token hash
    const refreshTokenHash = Buffer.from(refreshToken).toString('base64');
    if (user.refreshTokenHash !== refreshTokenHash) {
      // Possible token reuse - revoke all
      await db.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
      return NextResponse.json(
        { success: false, error: 'Refresh token révoqué' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = await signToken(
      { userId: user.id, username: user.username },
      '15m'
    );

    // Generate new refresh token (rotation)
    const newRefreshToken = await signToken(
      { userId: user.id, type: 'refresh' },
      '7d'
    );
    const newRefreshTokenHash = Buffer.from(newRefreshToken).toString('base64');

    // Update refresh token hash
    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    // Set new refresh token cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
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
        },
      }
    );

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
