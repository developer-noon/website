import { NextResponse, type NextRequest } from 'next/server';

/**
 * Fast first check for dashboard routes: no session cookie means sign-in first.
 * The cookie is only checked for presence here. The dashboard layout and every API route still verify the session.
 * The original path is kept so invitation links and deep links work after sign-in.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('authjs.session-token') || request.cookies.has('__Secure-authjs.session-token');
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login/', request.url);
  loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: '/dashboard/:path*',
};
