import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// PATCH /api/tasks/[id]/status - Update task status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Le statut est requis' },
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

    const task = await db.task.update({
      where: { id: params.id },
      data: { status },
      include: {
        project: true,
      },
    });

    const formattedTask = {
      ...task,
      tags: task.tags ? task.tags.split(',').filter(Boolean) : [],
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : [],
      reminders: task.reminders ? JSON.parse(task.reminders) : [],
      recurring: task.recurring ? JSON.parse(task.recurring) : undefined,
    };

    return NextResponse.json({
      success: true,
      data: formattedTask,
      message: 'Statut mis à jour avec succès',
    });
  } catch (error) {
    console.error('PATCH status error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
