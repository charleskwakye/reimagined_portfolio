import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Verify file is a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    
    // Upload file to Vercel Blob Storage
    const fileName = `CV_${Date.now()}.pdf`;
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user's CV URL in the database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resumeUrl: blob.url,
        updatedAt: new Date(),
      },
    });
    
    // Revalidate the CV page
    revalidatePath('/cv');
    revalidatePath('/admin/cv');
    
    return NextResponse.json({ 
      success: true,
      url: blob.url 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 