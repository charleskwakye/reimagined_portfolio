import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if language exists before deleting
    const existingLanguage = await prisma.language.findUnique({
      where: { id }
    });

    if (!existingLanguage) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      );
    }

    // Delete the language
    await prisma.language.delete({
      where: { id }
    });

    // Revalidate affected paths
    revalidatePath('/admin/languages');
    revalidatePath('/about');

    return NextResponse.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    return NextResponse.json(
      { error: 'Failed to delete language' },
      { status: 500 }
    );
  }
}