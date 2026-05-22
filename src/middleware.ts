// Supabase 세션 쿠키 존재 여부만 확인 (네트워크 요청 없음)
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Supabase가 설정하는 세션 쿠키 이름 패턴: sb-<project-ref>-auth-token
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
  )

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
