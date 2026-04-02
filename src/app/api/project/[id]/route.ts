import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getProjectById } from '@/lib/actions/user';
import { del } from '@vercel/blob';

// Helper function to extract URLs from content blocks
function extractUrlsFromContentBlocks(contentBlocks: any[]) {
  const urls = new Set<string>();
  
  contentBlocks.forEach(block => {
    if (block.url && block.url.includes('blob.vercel-storage.com')) {
      urls.add(block.url);
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure params is resolved
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const project = await getProjectById(id);
    
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    
    console.log('Received data for update:', id, 'Content blocks count:', data.contentBlocks?.length || 0);
    
    // Get existing project to compare content blocks
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return new NextResponse('Project not found', { status: 404 });
    }
    
    // Extract URLs from the existing and new content blocks
    const existingContentBlocks = existingProject.contentBlocks as any[];
    const newContentBlocks = data.contentBlocks || [];
    
    // Log a sample of content blocks for debugging
    if (newContentBlocks.length > 0) {
      console.log('Sample content block:', {
        id: newContentBlocks[0].id,
        type: newContentBlocks[0].type,
        content: newContentBlocks[0].content?.substring(0, 50) + (newContentBlocks[0].content?.length > 50 ? '...' : ''),
        contentLength: newContentBlocks[0].content?.length || 0
      });
    }
    
    const existingUrls = extractUrlsFromContentBlocks(existingContentBlocks);
    const newUrls = extractUrlsFromContentBlocks(newContentBlocks);
    
    // Find URLs that have been removed
    const urlsToDelete = Array.from(existingUrls).filter(url => !newUrls.has(url));
    
    // Process content blocks to ensure data types are correct
    const processedContentBlocks = newContentBlocks.map((block: any) => {
      // Create a clean copy of the block
      const cleanedBlock = { ...block };
      
      // Handle specific block types
      switch (block.type) {
        case 'paragraph':
        case 'heading':
          // Ensure content is a string
          if (block.content !== undefined) {
            cleanedBlock.content = String(block.content);
          }
          break;
          
        case 'document':
        case 'powerpoint':
          // Make sure showEmbed is a boolean
          cleanedBlock.showEmbed = Boolean(block.showEmbed);
          break;
          
        case 'list':
          // Ensure items is an array of strings
          if (Array.isArray(block.items)) {
            cleanedBlock.items = block.items.map(String);
          }
          break;
      }
      
      console.log(`Processed block ${block.id} (${block.type}):`, { 
        hasContent: 'content' in cleanedBlock,
        contentLength: cleanedBlock.content?.length || 0,
        hasItems: Array.isArray(cleanedBlock.items),
        itemsLength: Array.isArray(cleanedBlock.items) ? cleanedBlock.items.length : 0
      });
      
      return cleanedBlock;
    });
    
    // Update the project
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        shortDesc: data.shortDesc,
        coverImage: data.coverImage,
        githubLink: data.githubLink,
        demoLink: data.demoLink,
        videoUrl: data.videoUrl,
        technologies: data.technologies,
        featured: data.featured,
        contentBlocks: processedContentBlocks,
      },
    });
    
    // Debug log the saved project
    console.log('Project saved successfully:', {
      id: project.id,
      title: project.title,
      contentBlocksCount: (project.contentBlocks as any[]).length
    });
    
    // Delete removed files in the background
    if (urlsToDelete.length > 0) {
      console.log(`Deleting ${urlsToDelete.length} files from Vercel Blob Storage:`, urlsToDelete);
      
      // Don't await this to avoid blocking the response
      Promise.all(urlsToDelete.map(deleteFile))
        .then(results => {
          const successCount = results.filter(Boolean).length;
          console.log(`Successfully deleted ${successCount}/${urlsToDelete.length} files`);
        })
        .catch(error => {
          console.error('Error in batch file deletion:', error);
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update project', 
        details: error instanceof Error ? error.message : String(error) 
      }), 
      { status: 500 }
    );
  }
} 