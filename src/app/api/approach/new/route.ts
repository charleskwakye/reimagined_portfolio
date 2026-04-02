import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { title, description, order } = await request.json();

    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle automatic ordering
    // If order is 0 or not provided, it means we need to determine the next order number
    let orderValue = order || 0;
    if (orderValue <= 0) {
      // Find the highest order number currently in use
      const highestOrder = await prisma.approachItem.findFirst({
        where: { userId: user.id },
        orderBy: { order: 'desc' },
      });
      
      // Set the new item's order to be one higher than the current highest
      orderValue = highestOrder ? highestOrder.order + 1 : 1;
    } else {
      // If a specific order was provided, we need to update the order of other items
      // First, check if there's an item with the same order
      const existingItemWithSameOrder = await prisma.approachItem.findFirst({
        where: { 
          userId: user.id,
          order: orderValue 
        }
      });
      
      // If there is, increment the order of all items with the same or higher order
      if (existingItemWithSameOrder) {
        await prisma.approachItem.updateMany({
          where: {
            userId: user.id,
            order: {
              gte: orderValue
            }
          },
          data: {
            order: {
              increment: 1
            }
          }
        });
      }
    }

    // Create the approach item
    const approachItem = await prisma.approachItem.create({
      data: {
        id: randomUUID(),
        title,
        description,
        order: orderValue,
        updatedAt: new Date(),
        userId: user.id,
      },
    });

    // Revalidate the paths
    revalidatePath('/admin/about');
    revalidatePath('/about');

    return NextResponse.json(approachItem, { status: 201 });
  } catch (error) {
    console.error('Error creating approach item:', error);
    return NextResponse.json(
      { error: 'Failed to create approach item' },
      { status: 500 }
    );
  }
} 