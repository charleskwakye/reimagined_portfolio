import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

// Helper function to extract URLs from content blocks
function extractUrlsFromContentBlocks(contentBlocks: any[]) {
  const urls: string[] = [];

  contentBlocks.forEach(block => {
    if (block.url && block.url.includes('blob.vercel-storage.com')) {
      urls.push(block.url);
    }
  });

  return urls;
}

// Helper function to delete a file from Vercel Blob Storage
async function deleteFile(url: string) {
  try {
    // Extract the blob URL pattern to get the correct storage key
    const blobUrlPattern = /https:\/\/[^\/]+\.public\.blob\.vercel-storage\.com\/(.+)$/;
    const match = url.match(blobUrlPattern);

    if (match && match[1]) {
      const storageKey = decodeURIComponent(match[1]);
      console.log(`Deleting file with storageKey: ${storageKey}`);
      await del(storageKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication (temporarily disabled for testing)
    // const session = await getServerSession(authOptions);
    // Allow requests even without authentication for now
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Collect all file URLs from the project
    const filesToDelete = [];

    // Add cover image if it exists
    if (existingProject.coverImage && existingProject.coverImage.includes('blob.vercel-storage.com')) {
      filesToDelete.push(existingProject.coverImage);
    }

    // Add video URL if it exists
    if (existingProject.videoUrl && existingProject.videoUrl.includes('blob.vercel-storage.com')) {
      filesToDelete.push(existingProject.videoUrl);
    }

    // Extract file URLs from content blocks
    const contentBlocks = existingProject.contentBlocks as any[];
    const contentBlockUrls = extractUrlsFromContentBlocks(contentBlocks);
    filesToDelete.push(...contentBlockUrls);

    // Delete project first to maintain database integrity
    await prisma.project.delete({
      where: { id }
    });

    // Revalidate affected paths
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/'); // Also revalidate homepage in case it shows featured projects

    // Delete files in parallel
    if (filesToDelete.length > 0) {
      console.log(`Deleting ${filesToDelete.length} files associated with project ${id}`);

      const deleteResults = await Promise.allSettled(filesToDelete.map(deleteFile));

      const successCount = deleteResults.filter(
        result => result.status === 'fulfilled' && result.value === true
      ).length;

      console.log(`Successfully deleted ${successCount}/${filesToDelete.length} files`);
    } else {
      console.log(`No files to delete for project ${id}`);
    }

    return NextResponse.json({
      success: true,
      deletedFiles: filesToDelete.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 