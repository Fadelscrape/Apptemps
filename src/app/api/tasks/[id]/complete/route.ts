import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, calculateXP, getLevel, generateLexoRank } from '@/lib/api-utils';
import { ACHIEVEMENTS } from '@/types';
import type { RecurringRule } from '@/types';

function getNextDueDate(base: Date, rule: RecurringRule): Date {
  const next = new Date(base);
  const interval = rule.interval || 1;

  switch (rule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + interval * 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    default:
      next.setDate(next.getDate() + interval);
  }
  return next;
}

// PATCH /api/tasks/[id]/complete - Complete task with XP and streak
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (existingTask.status === 'done') {
      return NextResponse.json(
        { success: false, error: 'Tâche déjà complétée' },
        { status: 400 }
      );
    }

    // Get user for streak calculation
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Calculate XP
    const hasSubtasks = !!(existingTask.subtasks && JSON.parse(existingTask.subtasks).length > 0);
    const xpGained = calculateXP(existingTask.priority, hasSubtasks);
    const currentXP = user.xp + xpGained;
    const newLevel = getLevel(currentXP);

    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const lastDate = user.lastActivityDate ? new Date(user.lastActivityDate).toDateString() : null;

    let newStreakCurrent = user.streakCurrent;
    let newStreakBest = user.streakBest;

    if (lastDate === today) {
      // Already active today, no change
    } else if (lastDate === yesterday) {
      newStreakCurrent = user.streakCurrent + 1;
      newStreakBest = Math.max(user.streakBest, newStreakCurrent);
    } else {
      newStreakCurrent = 1;
    }

    // Check achievements
    const achievements = JSON.parse(user.achievements);
    const newAchievements = [...achievements];

    const achievementChecks = [
      { condition: () => true, id: 'first_task' },
      { condition: () => newStreakCurrent >= 7, id: 'streak_7' },
      { condition: () => newStreakCurrent >= 30, id: 'streak_30' },
      { condition: () => currentXP >= 32000, id: 'level_5' },
      { condition: () => existingTask.priority === 'urgent', id: 'urgent_5' },
      { condition: () => existingTask.dueDate && new Date(existingTask.dueDate) > new Date(), id: 'early_10' },
    ];

    for (const check of achievementChecks) {
      if (check.condition() && !newAchievements.includes(check.id)) {
        newAchievements.push(check.id);
      }
    }

    // Update task
    const task = await db.task.update({
      where: { id },
      data: {
        status: 'done',
        completedAt: new Date(),
      },
      include: {
        project: true,
      },
    });

    // Update user
    await db.user.update({
      where: { id: payload.userId },
      data: {
        xp: currentXP,
        level: newLevel,
        streakCurrent: newStreakCurrent,
        streakBest: newStreakBest,
        lastActivityDate: new Date(),
        achievements: JSON.stringify(newAchievements),
      },
    });

    // If recurring, create the next occurrence automatically
    const recurringConfig: RecurringRule | null = existingTask.recurring
      ? JSON.parse(existingTask.recurring)
      : null;

    if (recurringConfig) {
      const endDate = recurringConfig.endDate ? new Date(recurringConfig.endDate) : null;
      const hasNotExpired = !endDate || endDate > new Date();

      if (hasNotExpired) {
        const baseDate = existingTask.dueDate ? new Date(existingTask.dueDate) : new Date();
        const nextDue = getNextDueDate(baseDate, recurringConfig);

        // Find last task to get a valid position
        const lastTask = await db.task.findFirst({
          where: { ownerId: payload.userId, status: 'todo', deletedAt: null },
          orderBy: { position: 'desc' },
        });

        await db.task.create({
          data: {
            ownerId: existingTask.ownerId,
            projectId: existingTask.projectId ?? null,
            title: existingTask.title,
            description: existingTask.description ?? null,
            status: 'todo',
            priority: existingTask.priority,
            dueDate: nextDue,
            dueTime: existingTask.dueTime ?? null,
            estimatedMinutes: existingTask.estimatedMinutes ?? null,
            tags: existingTask.tags ?? '',
            position: generateLexoRank(lastTask?.position),
            subtasks: '[]',
            reminders: '[]',
            recurring: existingTask.recurring,
            xpReward: existingTask.xpReward,
            notes: existingTask.notes ?? null,
          },
        });
      }
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
      data: {
        task: formattedTask,
        xpGained,
        newLevel,
        newStreak: newStreakCurrent,
        newAchievements: newAchievements.filter(a => !achievements.includes(a)),
      },
      message: `Tâche complétée ! +${xpGained} XP`,
    });
  } catch (error) {
    console.error('PATCH complete error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
