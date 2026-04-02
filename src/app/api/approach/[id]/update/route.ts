import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, order } = await request.json();

    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Check if approach item exists
    const existingItem = await prisma.approachItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Approach item not found' },
        { status: 404 }
      );
    }

    // Update the approach item
    const updatedItem = await prisma.approachItem.update({
      where: { id },
      data: {
        title,
        description,
        order: order || 1
      }
    });

    // Revalidate the about page to ensure changes are reflected immediately
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating approach item:', error);
    return NextResponse.json(
      { error: 'Failed to update approach item' },
      { status: 500 }
    );
  }
} 