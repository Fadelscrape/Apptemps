import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// GET /api/projects - List all projects
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

    const projects = await db.project.findMany({
      where: {
        ownerId: payload.userId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          where: { deletedAt: null },
        },
      },
    });

    const formattedProjects = projects.map(project => ({
      ...project,
      progress: project.tasks.length > 0
        ? Math.round((project.tasks.filter((t: any) => t.status === 'done').length / project.tasks.length) * 100)
        : 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProjects,
    });
  } catch (error) {
    console.error('GET projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project
export async function POST(req: NextRequest) {
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
    const { name, emoji, color, description, deadline } = body;

    if (!name || !emoji || !color) {
      return NextResponse.json(
        { success: false, error: 'Le nom, l\'emoji et la couleur sont requis' },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        ownerId: payload.userId,
        name,
        emoji,
        color,
        description,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: 'Projet créé avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST project error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
