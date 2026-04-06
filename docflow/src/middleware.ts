import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for better-auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  // Auth routes (/auth/*) -> Redirect to /dashboard if logged in
  if (pathname.startsWith('/auth/')) {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Dashboard routes (/dashboard/*) -> Redirect to /auth/login if not logged in
  // or explicitly '/dashboard'
  if (pathname.startsWith('/dashboard') || pathname === '/dashboard') {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Ensure we redirect root `/` to `/dashboard` if logged in, or `/auth/login` if not
  if (pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
