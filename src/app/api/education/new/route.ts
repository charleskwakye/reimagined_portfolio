import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { degree, institution, location, startDate, endDate, current, description } = await request.json();

    // Validate input
    if (!degree || !institution || !startDate) {
      return NextResponse.json(
        { error: 'Degree, institution, and start date are required' },
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

    // Create the education entry
    const education = await prisma.education.create({
      data: {
        degree,
        institution,
        location,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        current: current || false,
        description,
        userId: user.id,
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/education');
    revalidatePath('/resume');

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Error creating education entry:', error);
    return NextResponse.json(
      { error: 'Failed to create education entry' },
      { status: 500 }
    );
  }
} 