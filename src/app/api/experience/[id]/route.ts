import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const experience = await prisma.experience.findUnique({
      where: { id }
    });

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
} 