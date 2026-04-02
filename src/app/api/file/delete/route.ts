import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Extract the path from the URL
    // For example, from "https://example.vercel-blob.com/profile-photos/image.jpg"
    // we extract "profile-photos/image.jpg"
    let path;
    try {
      // Handle blob URLs from client-side object URLs
      if (url.startsWith('blob:')) {
        return NextResponse.json({ success: true });
      }

      const urlObj = new URL(url);
      // Get everything after the hostname
      path = urlObj.pathname.split('/').slice(1).join('/');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    // Check if this is a profile photo
    const isProfilePhoto = path.startsWith('profile-photos/');

    try {
      // Delete the file from Vercel Blob
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      return NextResponse.json({ success: true });
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
        error: 'Blob deletion error: ' + errorMessage
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
} 