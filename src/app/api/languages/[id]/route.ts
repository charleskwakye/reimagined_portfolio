import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const language = await prisma.language.findUnique({
      where: { id }
    });

    if (!language) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, proficiency } = await request.json()
    const { id } = await params;

    const language = await prisma.language.update({
      where: {
        id
      },
      data: {
        name,
        proficiency
      }
    })

    return NextResponse.json({ language })
  } catch (error) {
    console.error('Error updating language:', error)
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
  }
}