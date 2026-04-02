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
      return NextResponse.json({ aboutSections: [] });
    }

    const aboutSections = await prisma.aboutSection.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return NextResponse.json({ aboutSections });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about sections' },
      { status: 500 }
    );
  }
} 