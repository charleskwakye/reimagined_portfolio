import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get the current user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch all approach items for the user
    const approachItems = await prisma.approachItem.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({ approachItems });
  } catch (error) {
    console.error('Error fetching approach items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approach items' },
      { status: 500 }
    );
  }
} 