import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// PATCH /api/tasks/[id]/subtasks/[subtaskId] - Toggle subtask
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subtaskId: string }> }) {
  try {
    const { id, subtaskId } = await params;
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

    const existingTask = await db.task.findFirst({
      where: {
        id,
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

    const subtasks = existingTask.subtasks ? JSON.parse(existingTask.subtasks) : [];
    const subtaskIndex = subtasks.findIndex((st: any) => st.id === subtaskId);

    if (subtaskIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Sous-tâche non trouvée' },
        { status: 404 }
      );
    }

    subtasks[subtaskIndex].done = !subtasks[subtaskIndex].done;

    const task = await db.task.update({
      where: { id },
      data: { subtasks: JSON.stringify(subtasks) },
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
      message: 'Sous-tâche mise à jour avec succès',
    });
  } catch (error) {
    console.error('PATCH subtask error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
