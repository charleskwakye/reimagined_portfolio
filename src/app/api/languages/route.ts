import { NextResponse } from 'next/server';
import { getUserLanguages } from '@/lib/actions/user';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const languages = await getUserLanguages();

    return NextResponse.json({
      languages: languages || [],
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
