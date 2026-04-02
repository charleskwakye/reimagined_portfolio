import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET endpoint to fetch a single certification by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch the certification
    const certification = await prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      return new NextResponse(
        JSON.stringify({ error: 'Certification not found' }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(certification), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching certification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch certification' }),
      { status: 500 }
    );
  }
} 