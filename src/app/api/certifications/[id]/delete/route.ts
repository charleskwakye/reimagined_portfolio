import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to delete certifications' }),
        { status: 401 }
      );
    }
    
    // Extract certification ID from URL params
    const { id } = params;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Certification ID is required' }),
        { status: 400 }
      );
    }

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

    // Delete the certification
    await prisma.certification.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete certification' }),
      { status: 500 }
    );
  }
} 