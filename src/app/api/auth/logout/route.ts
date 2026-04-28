import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      // Verify and revoke refresh token
      const payload = await verifyToken(refreshToken);
      if (payload && payload.userId) {
        await db.user.update({
          where: { id: payload.userId },
          data: { refreshTokenHash: null },
        });
      }
    }

    // Clear cookie
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion réussie' }
    );

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion réussie' }
    );
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 0,
    });
    return response;
  }
}
