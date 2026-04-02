import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getContactInfo, setContactInfo } from '@/lib/userPreferences';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const contactInfo = await getContactInfo(user.id);
    
    return NextResponse.json({ contact: contactInfo });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
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
    
    const data = await request.json();
    
    // Validate input
    if (!data.email || !data.location || !data.connectText) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update contact info in user preferences
    const contactInfo = {
      email: data.email,
      location: data.location,
      connectText: data.connectText
    };
    
    const success = await setContactInfo(user.id, contactInfo);
    
    if (!success) {
      throw new Error('Failed to save contact info');
    }
    
    return NextResponse.json({ 
      success: true,
      contact: contactInfo 
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    );
  }
} 