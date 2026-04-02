import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const education = await prisma.education.findUnique({
      where: { id }
    });

    if (!education) {
      return NextResponse.json(
        { error: 'Education entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error fetching education entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education entry' },
      { status: 500 }
    );
  }
} 