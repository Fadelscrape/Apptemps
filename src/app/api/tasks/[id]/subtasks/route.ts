import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// POST /api/tasks/[id]/subtasks - Add subtask
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Le titre de la sous-tâche est requis' },
        { status: 400 }
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
    const newSubtask = {
      id: crypto.randomUUID(),
      title,
      done: false,
      order: subtasks.length,
    };

    subtasks.push(newSubtask);

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
      message: 'Sous-tâche ajoutée avec succès',
    });
  } catch (error) {
    console.error('POST subtask error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
