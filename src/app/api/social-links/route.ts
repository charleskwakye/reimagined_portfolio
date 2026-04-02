import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ socialLinks: [] });
    }

    const socialLinks = await prisma.socialLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ socialLinks });
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { platform, url, icon } = await request.json();

    if (!platform || !url) {
      return NextResponse.json(
        { error: 'Platform and URL are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check total number of existing social links (limit to 4)
    const totalLinks = await prisma.socialLink.count({
      where: { userId: user.id }
    });

    if (totalLinks >= 4) {
      return NextResponse.json(
        { error: 'Maximum of 4 social links allowed' },
        { status: 400 }
      );
    }

    // Check if this platform already exists for this user
    const existingLink = await prisma.socialLink.findFirst({
      where: {
        userId: user.id,
        platform: platform
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Social link for this platform already exists' },
        { status: 400 }
      );
    }

    const socialLink = await prisma.socialLink.create({
      data: {
        id: crypto.randomUUID(),
        platform,
        url,
        icon: icon || null,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ socialLink });
  } catch (error) {
    console.error('Error creating social link:', error);
    return NextResponse.json(
      { error: 'Failed to create social link' },
      { status: 500 }
    );
  }
} 