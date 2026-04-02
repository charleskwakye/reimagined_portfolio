import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildPartialUpdatePayload } from '@/lib/utils';

interface ProjectUpdateBody {
  title?: string;
  shortDesc?: string;
  coverImage?: string | null;
  githubLink?: string | null;
  demoLink?: string | null;
  videoUrl?: string | null;
  contentBlocks?: any[];
  technologies?: string[];
  featured?: boolean;
}

const ALLOWED_FIELDS: (keyof ProjectUpdateBody)[] = [
  'title',
  'shortDesc',
  'coverImage',
  'githubLink',
  'demoLink',
  'videoUrl',
  'contentBlocks',
  'technologies',
  'featured',
];

// Helper function to validate project data
// Only validates fields that are PRESENT in the request
function validateProjectData(data: ProjectUpdateBody) {
  const errors: string[] = [];

  // Only validate title if it's provided (not undefined)
  if (data.title !== undefined) {
    if (!data.title) errors.push('Title cannot be empty');
    if (typeof data.title !== 'string') errors.push('Title must be a string');
  }

  // Only validate shortDesc if it's provided (not undefined)
  if (data.shortDesc !== undefined) {
    if (!data.shortDesc) errors.push('Short description cannot be empty');
    if (typeof data.shortDesc !== 'string') errors.push('Short description must be a string');
  }

  // Only validate optional fields if they are provided
  if (data.githubLink !== undefined && data.githubLink && !data.githubLink.startsWith('https://')) {
    errors.push('GitHub link must be a valid HTTPS URL');
  }

  if (data.demoLink !== undefined && data.demoLink && !data.demoLink.startsWith('http')) {
    errors.push('Demo link must be a valid URL');
  }

  if (data.technologies !== undefined && !Array.isArray(data.technologies)) {
    errors.push('Technologies must be an array');
  }

  if (data.contentBlocks !== undefined && !Array.isArray(data.contentBlocks)) {
    errors.push('Content blocks must be an array');
  }

  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }

  return errors;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const body: ProjectUpdateBody = await request.json();

    // Build update data using utility - allows null, excludes undefined
    const updateData = buildPartialUpdatePayload(body, ALLOWED_FIELDS);

    // Validate only the provided fields
    const validationErrors = validateProjectData(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project with only the provided fields
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Revalidate affected paths
    revalidatePath('/admin/projects');
    revalidatePath('/projects');

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
