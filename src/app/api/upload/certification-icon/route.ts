import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type - accept SVG, PNG, JPG, JPEG, GIF, WEBP
        const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: 'Only image files are allowed (SVG, PNG, JPG, JPEG, GIF, WEBP)' 
            }, { status: 400 });
        }

        // Validate file size (2MB limit for icons)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `certifications/icons/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({
            url: blob.url,
            filename: filename
        });

    } catch (error) {
        console.error('Error uploading icon:', error);
        return NextResponse.json(
            { error: 'Failed to upload icon' },
            { status: 500 }
        );
    }
}
