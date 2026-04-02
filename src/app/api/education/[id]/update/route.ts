import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildPartialUpdatePayload } from '@/lib/utils';
export const dynamic = 'force-dynamic';

interface EducationUpdateBody {
  degree?: string;
  institution?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

const ALLOWED_FIELDS: (keyof EducationUpdateBody)[] = [
  'degree',
  'institution',
  'location',
  'startDate',
  'endDate',
  'current',
  'description',
];

// Helper function to validate education data
function validateEducationData(data: any) {
  const errors: string[] = [];

  if (data.degree !== undefined) {
    if (!data.degree) errors.push('Degree cannot be empty');
  }

  if (data.institution !== undefined) {
    if (!data.institution) errors.push('Institution cannot be empty');
  }

  if (data.location !== undefined && data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  }

  if (data.startDate !== undefined) {
    if (!data.startDate) errors.push('Start date cannot be empty');
  }

  if (data.description !== undefined && data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  return errors;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: EducationUpdateBody = await request.json();

    // Check if education entry exists
    const existingEducation = await prisma.education.findUnique({
      where: { id }
    });

    if (!existingEducation) {
      return NextResponse.json(
        { error: 'Education entry not found' },
        { status: 404 }
      );
    }

    // Build update data using utility - allows null, excludes undefined
    const updateData = buildPartialUpdatePayload(body, ALLOWED_FIELDS);

    // Validate only the provided fields
    const validationErrors = validateEducationData(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Parse dates if provided
    if (updateData.startDate) {
      (updateData as any).startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate !== undefined) {
      (updateData as any).endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    // Update the education entry
    const updatedEducation = await prisma.education.update({
      where: { id },
      data: updateData as any,
    });

    // Revalidate affected paths
    revalidatePath('/admin/education');
    revalidatePath('/resume');

    return NextResponse.json(updatedEducation, { status: 200 });
  } catch (error) {
    console.error('Error updating education entry:', error);
    return NextResponse.json(
      { error: 'Failed to update education entry' },
      { status: 500 }
    );
  }
}
