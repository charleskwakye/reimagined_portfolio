import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find the internship
    const internship = await prisma.internship.findUnique({
      where: { id }
    });
    
    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internship' },
      { status: 500 }
    );
  }
} 