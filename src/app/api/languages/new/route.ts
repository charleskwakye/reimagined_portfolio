import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, proficiency } = await request.json();

    // Validate input
    if (!name || !proficiency) {
      return NextResponse.json(
        { error: 'Name and proficiency are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the language
    const language = await prisma.language.create({
      data: {
        id: crypto.randomUUID(),
        name,
        proficiency,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/languages');
    revalidatePath('/about');

    return NextResponse.json({ language }, { status: 201 });
  } catch (error) {
    console.error('Error creating language:', error);
    return NextResponse.json(
      { error: 'Failed to create language' },
      { status: 500 }
    );
  }
} 