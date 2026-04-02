import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, proficiency } = await request.json();

    // Validate input
    if (!name || !proficiency) {
      return NextResponse.json(
        { error: 'Name and proficiency are required' },
        { status: 400 }
      );
    }

    // Check if language exists
    const existingLanguage = await prisma.language.findUnique({
      where: { id }
    });

    if (!existingLanguage) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      );
    }

    // Update the language
    const updatedLanguage = await prisma.language.update({
      where: { id },
      data: {
        name,
        proficiency,
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/languages');
    revalidatePath('/about');

    return NextResponse.json(updatedLanguage, { status: 200 });
  } catch (error) {
    console.error('Error updating language:', error);
    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    );
  }
} 