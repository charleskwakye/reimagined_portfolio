import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Delete the approach item
    await prisma.approachItem.delete({
      where: { id }
    });

    revalidatePath('/admin/about');
    revalidatePath('/about');

    return NextResponse.json(
      { message: 'Approach item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting approach item:', error);
    return NextResponse.json(
      { error: 'Failed to delete approach item' },
      { status: 500 }
    );
  }
} 