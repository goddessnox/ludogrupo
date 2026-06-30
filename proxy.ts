import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const path = request.nextUrl.pathname
  const isLoginPage = path === "/login"
  const isSetupPage = path === "/setup"
  const isApi = path.startsWith("/api")
  const isStatic = path.startsWith("/_next") || path === "/favicon.ico"

  if (isApi || isStatic) return NextResponse.next()

  if (!token && !isLoginPage && !isSetupPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}