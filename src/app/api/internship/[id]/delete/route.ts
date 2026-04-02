import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if internship exists before deleting
    const existingInternship = await prisma.internship.findUnique({
      where: { id }
    });

    if (!existingInternship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }
    
    // Delete the internship
    await prisma.internship.delete({
      where: { id }
    });
    
    // Revalidate affected paths
    revalidatePath('/admin/internship');
    revalidatePath('/internship');
    
    return NextResponse.json(
      { message: 'Internship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      { error: 'Failed to delete internship' },
      { status: 500 }
    );
  }
} 