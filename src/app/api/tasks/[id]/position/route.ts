import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// PATCH /api/tasks/[id]/position - Update task position
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { position } = body;

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'La position est requise' },
        { status: 400 }
      );
    }

    const existingTask = await db.task.findFirst({
      where: {
        id: params.id,
        ownerId: payload.userId,
        deletedAt: null,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      );
    }

    await db.task.update({
      where: { id: params.id },
      data: { position },
    });

    return NextResponse.json({
      success: true,
      message: 'Position mise à jour avec succès',
    });
  } catch (error) {
    console.error('PATCH position error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
