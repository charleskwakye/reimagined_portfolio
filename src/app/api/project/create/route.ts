import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    // Return 404 instead of 401 to hide the existence of this endpoint from unauthorized users
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Get request body
    const data = await req.json();

    // Debug log the received data
    console.log('Received project data:', JSON.stringify(data, null, 2));

    // Validation
    if (!data.title || !data.shortDesc) {
      return NextResponse.json(
        { error: 'Title and short description are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check that we're only including fields that exist in the Prisma schema
    const projectData = {
      title: data.title,
      shortDesc: data.shortDesc,
      coverImage: data.coverImage || null,
      githubLink: data.githubLink || null,
      demoLink: data.demoLink || null,
      videoUrl: data.videoUrl || null,
      contentBlocks: Array.isArray(data.contentBlocks) ? data.contentBlocks : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      featured: Boolean(data.featured),
      userId: user.id,
    };

    // Debug log the processed data that will be sent to Prisma
    console.log('Processed project data for Prisma:', JSON.stringify(projectData, null, 2));

    // Create project
    const project = await prisma.project.create({
      data: projectData
    });

    // Revalidate affected paths
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/'); // Also revalidate homepage in case it shows featured projects

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    // Get detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    console.error('Error creating project:', errorMessage);

    return NextResponse.json(
      { error: `Failed to create project: ${errorMessage}` },
      { status: 500 }
    );
  }
} 