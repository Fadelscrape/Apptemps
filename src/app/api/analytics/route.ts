import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from '@/lib/api-utils';

// GET /api/analytics - Get analytics summary
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';

    // Get user
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Summary analytics
    if (type === 'summary') {
      const todayStart = getStartOfDay();
      const todayEnd = getEndOfDay();
      const weekStart = getStartOfWeek();
      const weekEnd = getEndOfWeek();

      const todayTasks = await db.task.count({
        where: {
          ownerId: payload.userId,
          deletedAt: null,
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      const todayCompleted = await db.task.count({
        where: {
          ownerId: payload.userId,
          deletedAt: null,
          status: 'done',
          completedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      const weekCompleted = await db.task.count({
        where: {
          ownerId: payload.userId,
          deletedAt: null,
          status: 'done',
          completedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          todayCompleted,
          todayTotal: todayTasks,
          weekCompleted,
          streakCurrent: user.streakCurrent,
          totalXP: user.xp,
          level: user.level,
        },
      });
    }

    // Heatmap data
    if (type === 'heatmap') {
      const tasks = await db.task.findMany({
        where: {
          ownerId: payload.userId,
          deletedAt: null,
          status: 'done',
          completedAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          completedAt: true,
        },
      });

      const heatmap: Record<string, number> = {};

      for (const task of tasks) {
        if (task.completedAt) {
          const date = new Date(task.completedAt).toISOString().split('T')[0];
          heatmap[date] = (heatmap[date] || 0) + 1;
        }
      }

      const heatmapData = Object.entries(heatmap).map(([date, count]) => ({
        date,
        count,
      }));

      return NextResponse.json({
        success: true,
        data: heatmapData,
      });
    }

    // Weekly data
    if (type === 'weekly') {
      const weeklyData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = getStartOfDay(date);
        const dayEnd = getEndOfDay(date);

        const completed = await db.task.count({
          where: {
            ownerId: payload.userId,
            deletedAt: null,
            status: 'done',
            completedAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        weeklyData.push({
          date: date.toISOString().split('T')[0],
          completed,
        });
      }

      return NextResponse.json({
        success: true,
        data: weeklyData,
      });
    }

    // Priorities data
    if (type === 'priorities') {
      const priorities = ['low', 'medium', 'high', 'urgent'] as const;
      const priorityData = [];

      for (const priority of priorities) {
        const count = await db.task.count({
          where: {
            ownerId: payload.userId,
            deletedAt: null,
            priority,
            status: 'done',
            completedAt: {
              gte: getStartOfWeek(),
            },
          },
        });

        priorityData.push({ priority, count });
      }

      return NextResponse.json({
        success: true,
        data: priorityData,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Type d\'analyse inconnu' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
