import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, icon, color } = await request.json();

    // Validate input
    if (!name || !icon) {
      return NextResponse.json(
        { error: 'Name and icon are required' },
        { status: 400 }
      );
    }

    // Check if specialty exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id }
    });

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }

    // Update the specialty
    const updatedSpecialty = await prisma.specialty.update({
      where: { id },
      data: {
        name,
        icon,
        color: color || existingSpecialty.color,
      },
    });

    // Revalidate affected paths
    revalidatePath('/admin/specialties');
    revalidatePath('/about');

    return NextResponse.json(updatedSpecialty, { status: 200 });
  } catch (error) {
    console.error('Error updating specialty:', error);
    return NextResponse.json(
      { error: 'Failed to update specialty' },
      { status: 500 }
    );
  }
} 