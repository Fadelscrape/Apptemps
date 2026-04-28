import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/api-utils';

// GET /api/projects/[id] - Get single project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const project = await db.project.findFirst({
      where: {
        id: params.id,
        ownerId: payload.userId,
      },
      include: {
        tasks: {
          where: { deletedAt: null },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const formattedProject = {
      ...project,
      progress: project.tasks.length > 0
        ? Math.round((project.tasks.filter((t: any) => t.status === 'done').length / project.tasks.length) * 100)
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: formattedProject,
    });
  } catch (error) {
    console.error('GET project error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { name, emoji, color, description, deadline, status } = body;

    const existingProject = await db.project.findFirst({
      where: {
        id: params.id,
        ownerId: payload.userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) updateData.status = status;

    const project = await db.project.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Projet mis à jour avec succès',
    });
  } catch (error) {
    console.error('PUT project error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Archive project
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existingProject = await db.project.findFirst({
      where: {
        id: params.id,
        ownerId: payload.userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    await db.project.update({
      where: { id: params.id },
      data: { status: 'archived' },
    });

    return NextResponse.json({
      success: true,
      message: 'Projet archivé avec succès',
    });
  } catch (error) {
    console.error('DELETE project error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
