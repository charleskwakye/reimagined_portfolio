import { NextResponse } from 'next/server';
import { getUserPreference, setUserPreference } from '@/lib/userPreferences';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the first user (portfolio owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ order: [] });
    }

    const specialtiesOrder = await getUserPreference(user.id, 'specialtiesOrder');
    
    return NextResponse.json({
      order: specialtiesOrder || [],
    });
  } catch (error) {
    console.error('Error fetching specialties order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties order' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the first user (portfolio owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { order, items } = await request.json();
    
    // Support both formats: { order: [] } (new) and { items: [] } (legacy)
    let orderedIds;
    if (order && Array.isArray(order)) {
      orderedIds = order;
    } else if (items && Array.isArray(items)) {
      orderedIds = items.map((item) => item.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid request: order or items must be an array' },
        { status: 400 }
      );
    }
    
    // Save the order to UserPreferences with correct userId
    await setUserPreference(user.id, 'specialtiesOrder', orderedIds);
    
    return NextResponse.json({
      message: 'Specialties order updated successfully',
      order: orderedIds,
    });
  } catch (error) {
    console.error('Error updating specialties order:', error);
    return NextResponse.json(
      { error: 'Failed to update specialties order' },
      { status: 500 }
    );
  }
} 