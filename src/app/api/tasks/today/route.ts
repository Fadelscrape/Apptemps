import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getStartOfDay, getEndOfDay } from '@/lib/api-utils';

// GET /api/tasks/today - Get today's tasks
export async function GET(req: NextRequest) {
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

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    // Get tasks due today OR overdue and not done
    const tasks = await db.task.findMany({
      where: {
        ownerId: payload.userId,
        deletedAt: null,
        OR: [
          {
            dueDate: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
          {
            status: { not: 'done' },
            dueDate: { lt: todayStart },
          },
        ],
      },
      orderBy: [
        { dueDate: 'asc' },
        { dueTime: 'asc' },
        { priority: 'desc' },
        { position: 'asc' },
      ],
      include: {
        project: true,
      },
    });

    const formattedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags ? task.tags.split(',').filter(Boolean) : [],
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : [],
      reminders: task.reminders ? JSON.parse(task.reminders) : [],
      recurring: task.recurring ? JSON.parse(task.recurring) : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTasks,
    });
  } catch (error) {
    console.error('GET today tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
