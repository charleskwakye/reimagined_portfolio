import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, icon, color } = await request.json();

    // Validate input
    if (!name || !icon) {
      return NextResponse.json(
        { error: 'Name and icon are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the specialty
    const specialty = await prisma.specialty.create({
      data: {
        id: randomUUID(),
        name,
        icon,
        color: color || '#3b82f6', // Default blue if not provided
        updatedAt: new Date(),
        userId: user.id,
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/specialties');
    revalidatePath('/about');

    return NextResponse.json(specialty, { status: 201 });
  } catch (error) {
    console.error('Error creating specialty:', error);
    return NextResponse.json(
      { error: 'Failed to create specialty' },
      { status: 500 }
    );
  }
} 