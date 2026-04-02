import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { languageOrder } = await request.json()

    // Get the first user (portfolio owner)
    const user = await prisma.user.findFirst()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store language order in UserPreference using key-value pattern
    const userId = user.id

    await prisma.userPreference.upsert({
      where: {
        userId_key: {
          userId: userId,
          key: 'language_order'
        }
      },
      update: {
        value: JSON.stringify(languageOrder)
      },
      create: {
        userId: userId,
        key: 'language_order',
        value: JSON.stringify(languageOrder)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving language order:', error)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get the first user (portfolio owner)
    const user = await prisma.user.findFirst()
    if (!user) {
      return NextResponse.json({ languageOrder: [] })
    }

    const userId = user.id

    const preference = await prisma.userPreference.findUnique({
      where: {
        userId_key: {
          userId: userId,
          key: 'language_order'
        }
      }
    })

    const languageOrder = preference ? JSON.parse(preference.value) : []

    return NextResponse.json({ languageOrder })
  } catch (error) {
    console.error('Error fetching language order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
