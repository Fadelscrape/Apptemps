import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// Middleware to verify authentication
async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);
  return payload;
}

// GET /api/tasks/[id] - Get single task
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await authenticate(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        ownerId: payload.userId,
        deletedAt: null,
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      );
    }

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
    });
  } catch (error) {
    console.error('GET task error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await authenticate(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      dueTime,
      estimatedMinutes,
      actualMinutes,
      projectId,
      tags,
      position,
      subtasks,
      recurring,
      notes,
    } = body;

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

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (dueTime !== undefined) updateData.dueTime = dueTime;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    if (actualMinutes !== undefined) updateData.actualMinutes = actualMinutes;
    if (projectId !== undefined) updateData.projectId = projectId || null;
    if (tags !== undefined) updateData.tags = tags.join(',');
    if (position !== undefined) updateData.position = position;
    if (subtasks !== undefined) updateData.subtasks = JSON.stringify(subtasks);
    if (recurring !== undefined) updateData.recurring = recurring ? JSON.stringify(recurring) : null;
    if (notes !== undefined) updateData.notes = notes;

    const task = await db.task.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Tâche mise à jour avec succès',
    });
  } catch (error) {
    console.error('PUT task error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Soft delete task
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await authenticate(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
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
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Tâche supprimée avec succès',
    });
  } catch (error) {
    console.error('DELETE task error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
