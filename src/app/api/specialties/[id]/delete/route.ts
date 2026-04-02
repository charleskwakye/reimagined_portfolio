import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if specialty exists before deleting
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id }
    });

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }
    
    // Delete the specialty
    await prisma.specialty.delete({
      where: { id }
    });
    
    // Revalidate affected paths
    revalidatePath('/admin/specialties');
    revalidatePath('/about');
    
    return NextResponse.json(
      { message: 'Specialty deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting specialty:', error);
    return NextResponse.json(
      { error: 'Failed to delete specialty' },
      { status: 500 }
    );
  }
} 