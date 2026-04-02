import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { platform, url, icon } = await request.json();
    const { id } = params;

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

    // Check if another social link with this platform exists (excluding current one)
    const existingLink = await prisma.socialLink.findFirst({
      where: {
        userId: user.id,
        platform: platform,
        id: { not: id }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Social link for this platform already exists' },
        { status: 400 }
      );
    }

    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: {
        platform,
        url,
        icon: icon || null
      }
    });

    return NextResponse.json({ socialLink });
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json(
      { error: 'Failed to update social link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.socialLink.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json(
      { error: 'Failed to delete social link' },
      { status: 500 }
    );
  }
} 