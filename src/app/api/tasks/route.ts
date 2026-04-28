import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, generateLexoRank, calculateXP, getStartOfDay, getEndOfDay } from '@/lib/api-utils';

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

// GET /api/tasks - List tasks
export async function GET(req: NextRequest) {
  try {
    const payload = await authenticate(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      ownerId: payload.userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: { position: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: true,
      },
    });

    const total = await db.task.count({ where });

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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create task
export async function POST(req: NextRequest) {
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
      status = 'inbox',
      priority = 'medium',
      dueDate,
      dueTime,
      estimatedMinutes,
      projectId,
      tags = [],
      recurring,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    // Get position for new task
    const lastTask = await db.task.findFirst({
      where: {
        ownerId: payload.userId,
        status,
        deletedAt: null,
      },
      orderBy: { position: 'desc' },
    });

    const position = generateLexoRank(lastTask?.position);

    // Calculate XP reward
    const xpReward = calculateXP(priority, false);

    const task = await db.task.create({
      data: {
        ownerId: payload.userId,
        projectId: projectId || null,
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime,
        estimatedMinutes,
        tags: tags.join(','),
        position,
        subtasks: '[]',
        reminders: '[]',
        recurring: recurring ? JSON.stringify(recurring) : null,
        xpReward,
      },
      include: {
        project: true,
      },
    });

    const formattedTask = {
      ...task,
      tags: [],
      subtasks: [],
      reminders: [],
      recurring: undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedTask,
        message: 'Tâche créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST task error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
