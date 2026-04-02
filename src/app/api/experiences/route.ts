import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ experiences: [] });
    }

    const experiences = await prisma.experience.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
} 