import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildPartialUpdatePayload } from '@/lib/utils';

interface ExperienceUpdateBody {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

const ALLOWED_FIELDS: (keyof ExperienceUpdateBody)[] = [
  'title',
  'company',
  'location',
  'startDate',
  'endDate',
  'current',
  'description',
];

// Helper function to validate experience data
function validateExperienceData(data: any) {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title) errors.push('Title cannot be empty');
  }

  if (data.company !== undefined) {
    if (!data.company) errors.push('Company cannot be empty');
  }

  if (data.location !== undefined && data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  }

  if (data.startDate !== undefined) {
    if (!data.startDate) errors.push('Start date cannot be empty');
  }

  if (data.description !== undefined) {
    if (!data.description) errors.push('Description cannot be empty');
  }

  return errors;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: ExperienceUpdateBody = await request.json();

    // Check if experience exists
    const existingExperience = await prisma.experience.findUnique({
      where: { id }
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Build update data using utility - allows null, excludes undefined
    const updateData = buildPartialUpdatePayload(body, ALLOWED_FIELDS);

    // Validate only the provided fields
    const validationErrors = validateExperienceData(updateData);
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

    // Update the experience
    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: updateData as any,
    });

    // Revalidate affected paths
    revalidatePath('/admin/experience');
    revalidatePath('/resume');

    return NextResponse.json(updatedExperience, { status: 200 });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}
