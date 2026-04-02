import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
    try {
        // Unflag all projects
        const result = await prisma.project.updateMany({
            where: { featured: true },
            data: { featured: false }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully unflagged ${result.count} projects`
        });

    } catch (error) {
        console.error('Error unflagging projects:', error);
        return NextResponse.json(
            { error: 'Failed to unflag projects' },
            { status: 500 }
        );
    }
}
