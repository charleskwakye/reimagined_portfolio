import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static assets and _next paths
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (path.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If authenticated, proceed
    if (token) {
      // Allow access to all admin routes (including login when already authenticated)
      return NextResponse.next();
    }

    // Special case for the admin login page - allow unauthenticated access only to this route
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // For unauthenticated users attempting to access any admin routes, return a 404 Not Found
    // This hides the existence of the admin section from unauthorized users
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
} 