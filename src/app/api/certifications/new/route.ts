import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to create certifications' }),
        { status: 401 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Get the first user (since this is a portfolio site with only one user)
    const user = await prisma.user.findFirst();
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    // Validate required fields
    if (!data.title || !data.organization || !data.year) {
      return new NextResponse(
        JSON.stringify({ error: 'Title, organization, and year are required' }),
        { status: 400 }
      );
    }

    // Create the certification
    const certification = await prisma.certification.create({
      data: {
        title: data.title,
        organization: data.organization,
        year: data.year,
        url: data.url || null,
        pdfUrl: data.pdfUrl || null,
        iconUrl: data.iconUrl || null,
        userId: user.id,
      },
    });

    return new NextResponse(
      JSON.stringify(certification),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating certification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create certification' }),
      { status: 500 }
    );
  }
} 