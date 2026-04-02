import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import cuid from 'cuid';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { title, company, location, startDate, endDate, current, description } = await request.json();

    // Validate input
    if (!title || !company || !startDate || !description) {
      return NextResponse.json(
        { error: 'Title, company, start date, and description are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Get current timestamp for both createdAt and updatedAt
    const now = new Date();

    // Create the experience with a generated ID and timestamps
    const experience = await prisma.experience.create({
      data: {
        id: cuid(), // Generate a unique ID
        title,
        company,
        location,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        current: current || false,
        description,
        userId: user.id,
        createdAt: now,
        updatedAt: now, // Add updatedAt field
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/experience');
    revalidatePath('/resume');

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
} 