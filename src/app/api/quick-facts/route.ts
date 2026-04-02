import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface QuickFact {
    location: string;
    yearsOfExperience: string;
    education: string;
    interests: string;
    languages: string;
}

// Helper function to extract metadata from about field
function extractMetadataFromAbout(about: string, key: string): string {
    const pattern = new RegExp(`\\[${key}:([^\\]]+)\\]`, 'i');
    const match = about.match(pattern);
    return match ? match[1].trim() : '';
}

// Helper function to save metadata in about field
function saveMetadataInAbout(about: string, metadata: QuickFact): string {
    let updatedAbout = about;

    // Remove existing metadata tags
    updatedAbout = updatedAbout.replace(/\[location:[^\]]+\]/gi, '');
    updatedAbout = updatedAbout.replace(/\[experience:[^\]]+\]/gi, '');
    updatedAbout = updatedAbout.replace(/\[education:[^\]]+\]/gi, '');
    updatedAbout = updatedAbout.replace(/\[interests:[^\]]+\]/gi, '');
    updatedAbout = updatedAbout.replace(/\[languages:[^\]]+\]/gi, '');

    // Add new metadata tags at the end
    const metadataTags = [
        `[location:${metadata.location}]`,
        `[experience:${metadata.yearsOfExperience}]`,
        `[education:${metadata.education}]`,
        `[interests:${metadata.interests}]`,
        `[languages:${metadata.languages}]`
    ].join(' ');

    return `${updatedAbout.trim()} ${metadataTags}`;
}

export async function GET() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({
                quickFacts: {
                    location: '',
                    yearsOfExperience: '',
                    education: '',
                    interests: '',
                    languages: ''
                }
            });
        }

        const about = user.about || '';
        const quickFacts: QuickFact = {
            location: extractMetadataFromAbout(about, 'location'),
            yearsOfExperience: extractMetadataFromAbout(about, 'experience'),
            education: extractMetadataFromAbout(about, 'education'),
            interests: extractMetadataFromAbout(about, 'interests'),
            languages: extractMetadataFromAbout(about, 'languages')
        };

        return NextResponse.json({ quickFacts });
    } catch (error) {
        console.error('Error fetching quick facts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quick facts' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const quickFacts: QuickFact = await request.json();

        // Validate required fields
        if (!quickFacts.location || !quickFacts.yearsOfExperience) {
            return NextResponse.json(
                { error: 'Location and years of experience are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const currentAbout = user.about || '';
        const updatedAbout = saveMetadataInAbout(currentAbout, quickFacts);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { about: updatedAbout }
        });

        return NextResponse.json({
            success: true,
            message: 'Quick facts updated successfully',
            quickFacts
        });
    } catch (error) {
        console.error('Error updating quick facts:', error);
        return NextResponse.json(
            { error: 'Failed to update quick facts' },
            { status: 500 }
        );
    }
}
