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

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `certifications/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({
            url: blob.url,
            filename: filename
        });

    } catch (error) {
        console.error('Error uploading PDF:', error);
        return NextResponse.json(
            { error: 'Failed to upload PDF' },
            { status: 500 }
        );
    }
}
