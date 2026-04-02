import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const approachItem = await prisma.approachItem.findUnique({
      where: {
        id,
      },
    });

    if (!approachItem) {
      return NextResponse.json(
        { error: 'Approach item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(approachItem);
  } catch (error) {
    console.error('Error fetching approach item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approach item' },
      { status: 500 }
    );
  }
} 