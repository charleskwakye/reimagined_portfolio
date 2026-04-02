import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { buildPartialUpdatePayload } from '@/lib/utils';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CertificationUpdateBody {
  title?: string;
  organization?: string;
  year?: string;
  url?: string | null;
  pdfUrl?: string | null;
  iconUrl?: string | null;
}

const ALLOWED_FIELDS: (keyof CertificationUpdateBody)[] = [
  'title',
  'organization',
  'year',
  'url',
  'pdfUrl',
  'iconUrl',
];

// Helper function to validate certification data
function validateCertificationData(data: any) {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title) errors.push('Title cannot be empty');
  }

  if (data.organization !== undefined) {
    if (!data.organization) errors.push('Organization cannot be empty');
  }

  if (data.year !== undefined) {
    if (!data.year) errors.push('Year cannot be empty');
  }

  return errors;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to update certifications' }),
        { status: 401 }
      );
    }

    // Extract certification ID from URL params (Next.js 15 requires awaiting params)
    const { id } = await params;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Certification ID is required' }),
        { status: 400 }
      );
    }

    // Parse request body
    const body: CertificationUpdateBody = await request.json();

    // Check if certification exists
    const existingCertification = await prisma.certification.findUnique({
      where: { id },
    });

    if (!existingCertification) {
      return new NextResponse(
        JSON.stringify({ error: 'Certification not found' }),
        { status: 404 }
      );
    }

    // Build update data using utility - allows null, excludes undefined
    const updateData = buildPartialUpdatePayload(body, ALLOWED_FIELDS);

    // Validate only the provided fields
    const validationErrors = validateCertificationData(updateData);
    if (validationErrors.length > 0) {
      return new NextResponse(
        JSON.stringify({ errors: validationErrors }),
        { status: 400 }
      );
    }

    // Update the certification
    const updatedCertification = await prisma.certification.update({
      where: { id },
      data: updateData as any,
    });

    return new NextResponse(
      JSON.stringify(updatedCertification),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating certification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update certification' }),
      { status: 500 }
    );
  }
}

// Also support POST method for consistency
export async function POST(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  return PUT(request, { params: Promise.resolve(resolvedParams) });
}
