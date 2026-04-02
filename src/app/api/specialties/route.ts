import { NextResponse } from 'next/server';
import { getUserSpecialties } from '@/lib/actions/user';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const specialties = await getUserSpecialties();
    
    return NextResponse.json({
      specialties: specialties || [],
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
} 