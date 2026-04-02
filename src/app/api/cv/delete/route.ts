import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has a resume URL
    if (!user.resumeUrl) {
      return NextResponse.json(
        { error: 'No CV found to delete' },
        { status: 400 }
      );
    }
    
    try {
      // Try to delete the file from blob storage
      // This might fail if the URL is not a Vercel Blob URL
      await del(user.resumeUrl);
    } catch (error) {
      console.error('Could not delete file from blob storage:', error);
      // Continue anyway to update the database
    }
    
    // Update user's CV URL in the database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resumeUrl: null,
        updatedAt: new Date(),
      },
    });
    
    // Revalidate the CV page
    revalidatePath('/cv');
    revalidatePath('/admin/cv');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json(
      { error: 'Failed to delete CV' },
      { status: 500 }
    );
  }
} 