import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, order } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check if the about section exists
    const existingSection = await prisma.aboutSection.findUnique({
      where: {
        id,
      },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'About section not found' },
        { status: 404 }
      );
    }

    // Update the about section
    const updatedSection = await prisma.aboutSection.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        order: typeof order === 'number' ? order : existingSection.order,
      },
    });

    // Revalidate the about page to ensure changes are reflected immediately
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating about section:', error);
    return NextResponse.json(
      { error: 'Failed to update about section' },
      { status: 500 }
    );
  }
} 