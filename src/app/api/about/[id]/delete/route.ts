import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if about section exists
    const existingSection = await prisma.aboutSection.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'About section not found' },
        { status: 404 }
      );
    }
    
    await prisma.aboutSection.delete({
      where: {
        id,
      },
    });
    
    // Revalidate the about page to ensure changes are reflected immediately
    revalidatePath('/about');
    revalidatePath('/admin/about');
    
    return NextResponse.json(
      { message: 'About section deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting about section:', error);
    return NextResponse.json(
      { error: 'Failed to delete about section' },
      { status: 500 }
    );
  }
} 