import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Redirect logged-in users from login to templates page
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && authToken) {
    const url = new URL('/templates', request.url)
    return NextResponse.redirect(url)
  }

  // Allow access to the landing page (root path) without authentication
  if (pathname === '/') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('/assets') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico')
  ) {
    return NextResponse.next()
  }

  if (!authToken) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // Add the Authorization header to the request
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Authorization', `Bearer ${authToken}`)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}