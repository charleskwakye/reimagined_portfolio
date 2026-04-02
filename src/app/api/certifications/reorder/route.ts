import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { setCertificationOrder, getCertificationOrder } from '@/lib/userPreferences';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const orderMap = await getCertificationOrder(user.id);
    
    return NextResponse.json({ order: orderMap });
  } catch (error) {
    console.error('Error getting certification order:', error);
    return NextResponse.json(
      { error: 'Failed to get certification order' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { items } = await request.json();
    
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items array' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Convert items to order map
    const orderMap: Record<string, number> = {};
    items.forEach(item => {
      orderMap[item.id] = item.order;
    });
    
    // Save to user preferences
    const success = await setCertificationOrder(user.id, orderMap);
    
    if (!success) {
      throw new Error('Failed to save certification order');
    }
    
    // Revalidate affected paths
    revalidatePath('/resume');
    revalidatePath('/admin/resume');
    
    return NextResponse.json({ 
      success: true,
      order: orderMap
    });
  } catch (error) {
    console.error('Error reordering certifications:', error);
    return NextResponse.json(
      { error: 'Failed to reorder certifications' },
      { status: 500 }
    );
  }
} 