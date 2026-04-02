import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if experience exists before deleting
    const existingExperience = await prisma.experience.findUnique({
      where: { id }
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    // Delete the experience
    await prisma.experience.delete({
      where: { id }
    });
    
    // Revalidate affected paths
    revalidatePath('/admin/experience');
    revalidatePath('/resume');
    
    return NextResponse.json(
      { message: 'Experience deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
} 