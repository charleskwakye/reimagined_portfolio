import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const specialty = await prisma.specialty.findUnique({
      where: {
        id,
      },
    });

    if (!specialty) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(specialty);
  } catch (error) {
    console.error('Error fetching specialty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialty' },
      { status: 500 }
    );
  }
} 