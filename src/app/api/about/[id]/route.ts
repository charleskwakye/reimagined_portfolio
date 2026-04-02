import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const aboutSection = await prisma.aboutSection.findUnique({
      where: {
        id,
      },
    });

    if (!aboutSection) {
      return NextResponse.json(
        { error: 'About section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(aboutSection);
  } catch (error) {
    console.error('Error fetching about section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about section' },
      { status: 500 }
    );
  }
} 