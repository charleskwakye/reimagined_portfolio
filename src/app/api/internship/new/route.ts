import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const {
      title,
      company,
      location,
      startDate,
      endDate,
      shortDesc,
      contentBlocks,
      technologies,
      testimonials,
      outcome
    } = await request.json();

    // Validate required fields
    if (!title || !company || !startDate || !shortDesc) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, startDate, and shortDesc are required' },
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
    let parsedEndDate = null;
    if (endDate) {
      parsedEndDate = new Date(endDate);
    }

    // Create the internship
    const internship = await prisma.internship.create({
      data: {
        title,
        company,
        location,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        shortDesc,
        contentBlocks: contentBlocks || [], // Default to empty array if not provided
        technologies: technologies || [],    // Default to empty array if not provided
        testimonials: testimonials || null,
        outcome,
        userId: user.id,
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/internship');
    revalidatePath('/internship');

    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { error: 'Failed to create internship' },
      { status: 500 }
    );
  }
} 