import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildPartialUpdatePayload } from '@/lib/utils';

interface InternshipUpdateBody {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  shortDesc?: string;
  contentBlocks?: any[];
  technologies?: string[];
  testimonials?: any[];
  outcome?: string;
}

const ALLOWED_FIELDS: (keyof InternshipUpdateBody)[] = [
  'title',
  'company',
  'location',
  'startDate',
  'endDate',
  'shortDesc',
  'contentBlocks',
  'technologies',
  'testimonials',
  'outcome',
];

// Helper function to validate internship data
function validateInternshipData(data: any) {
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

  if (data.shortDesc !== undefined) {
    if (!data.shortDesc) errors.push('Short description cannot be empty');
  }

  return errors;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const body: InternshipUpdateBody = await request.json();

    // Check if internship exists
    const existingInternship = await prisma.internship.findUnique({
      where: { id }
    });

    if (!existingInternship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Build update data using utility - allows null, excludes undefined
    const updateData = buildPartialUpdatePayload(body, ALLOWED_FIELDS);

    // Validate only the provided fields
    const validationErrors = validateInternshipData(updateData);
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

    // Update the internship
    const updatedInternship = await prisma.internship.update({
      where: { id },
      data: updateData as any,
    });

    // Revalidate affected paths
    revalidatePath('/admin/internship');
    revalidatePath('/internship');

    return NextResponse.json(updatedInternship);
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { error: 'Failed to update internship' },
      { status: 500 }
    );
  }
}
