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
    
    // Check if education entry exists before deleting
    const existingEducation = await prisma.education.findUnique({
      where: { id }
    });

    if (!existingEducation) {
      return NextResponse.json(
        { error: 'Education entry not found' },
        { status: 404 }
      );
    }
    
    // Delete the education entry
    await prisma.education.delete({
      where: { id }
    });
    
    // Revalidate affected paths
    revalidatePath('/admin/education');
    revalidatePath('/resume');
    
    return NextResponse.json(
      { message: 'Education entry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting education entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete education entry' },
      { status: 500 }
    );
  }
} 