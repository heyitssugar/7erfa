import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async function (request: NextRequest) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('auth_token');

    // If no token and trying to access protected route, redirect to login
    if (!authToken && isProtectedRoute(request.nextUrl.pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return handler(request);
  };
}

function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/settings',
    '/bookings',
    '/wallet',
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}
