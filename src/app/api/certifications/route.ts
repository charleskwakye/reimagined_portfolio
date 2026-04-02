import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the first user (portfolio owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ certifications: [] });
    }

    const certifications = await prisma.certification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        year: 'desc',
      },
    });
    
    return NextResponse.json({ certifications });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
} 