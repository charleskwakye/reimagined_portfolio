import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('filename');
    const isProfilePhoto = request.nextUrl.searchParams.get('isProfilePhoto') === 'true';

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const blob = await request.blob();

    // Determine appropriate subdirectory based on file type
    let storageKey = filename;
    let fileCategory = 'other';

    // Check if it's a profile photo
    if (isProfilePhoto && contentType.startsWith('image/')) {
      // Sanitize filename to prevent path traversal
      const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      storageKey = `profile-photos/${cleanFilename}`;
      fileCategory = 'profile-photo';
    }
    // Check for presentations (.ppt, .pptx)
    else if (filename.toLowerCase().endsWith('.ppt') ||
      filename.toLowerCase().endsWith('.pptx') ||
      contentType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      contentType === 'application/vnd.ms-powerpoint') {
      storageKey = `presentations/${filename}`;
      fileCategory = 'presentation';
    }
    // Check for documents (.pdf, .doc, .docx)
    else if (filename.toLowerCase().endsWith('.pdf') ||
      filename.toLowerCase().endsWith('.doc') ||
      filename.toLowerCase().endsWith('.docx') ||
      contentType === 'application/pdf' ||
      contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      storageKey = `documents/${filename}`;
      fileCategory = 'document';
    }
    // Check for images
    else if (contentType.startsWith('image/')) {
      storageKey = `images/${filename}`;
      fileCategory = 'image';
    }

    try {
      // Upload to Vercel Blob with explicit token
      const { url } = await put(storageKey, blob, {
        contentType,
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      // Prepare response
      const response: any = { url };

      // Add metadata for profile photos
      if (isProfilePhoto) {
        response.filename = filename;
        response.uploadedAt = new Date().toISOString();
      }

      return NextResponse.json(response);
    } catch (blobError) {
      // Handle specific Vercel Blob errors

      // Check if it's a token-related error
      const errorMessage = blobError instanceof Error ? blobError.message : String(blobError);
      if (errorMessage.includes('Access denied') || errorMessage.includes('token')) {
        return NextResponse.json({
          error: 'Vercel Blob configuration error: ' + errorMessage,
          details: 'Check that your BLOB_READ_WRITE_TOKEN is correctly set in your environment variables.'
        }, { status: 500 });
      }

      // For other blob errors
      return NextResponse.json({
        error: 'Blob storage error: ' + errorMessage
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 