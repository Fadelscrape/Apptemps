import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validateEmail, validateUsername, validatePassword, signToken } from '@/lib/api-utils';
import { XP_LEVELS } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, confirmPassword } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Le nom d\'utilisateur et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { success: false, error: 'Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques ou underscore' },
        { status: 400 }
      );
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 409 }
      );
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const defaultPreferences = {
      theme: 'dark' as const,
      pomodoroWork: 25,
      pomodoroBreak: 5,
      pomodoroLong: 15,
      notificationsEnabled: true,
      soundEnabled: true,
    };

    const user = await db.user.create({
      data: {
        username,
        email: email || null,
        password: hashedPassword,
        xp: 0,
        level: 1,
        streakCurrent: 0,
        streakBest: 0,
        achievements: '[]',
        preferences: JSON.stringify(defaultPreferences),
      },
    });

    // Generate access token
    const accessToken = await signToken(
      { userId: user.id, username: user.username },
      '15m'
    );

    // Generate refresh token
    const refreshToken = await signToken(
      { userId: user.id, type: 'refresh' },
      '7d'
    );
    const refreshTokenHash = Buffer.from(refreshToken).toString('base64');

    // Save refresh token hash
    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    // Set refresh token cookie
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
        message: 'Compte créé avec succès',
      },
      { status: 201 }
    );

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
