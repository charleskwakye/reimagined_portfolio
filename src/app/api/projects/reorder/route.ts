import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { projects } = await request.json();

    if (!Array.isArray(projects)) {
      return new NextResponse('Invalid project data', { status: 400 });
    }

    // Update each project's order with the provided values
    await Promise.all(
      projects.map(async ({ id, order }) => {
        if (!id || typeof order !== 'number') {
          console.error('Invalid project data entry:', { id, order });
          return;
        }

        await prisma.project.update({
          where: { id },
          data: { order },
        });
      })
    );

    // Revalidate affected paths  
    revalidatePath('/admin/projects');
    revalidatePath('/projects');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 