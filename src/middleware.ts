import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Protected routes
  const protectedPaths = ["/dashboard", "/consumables", "/machines", "/tasks", "/employees", "/settings", "/profile", "/contracts", "/classes", "/finances", "/reports"]
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect to login if not authenticated and trying to access protected route
  if (isProtectedPath) {
    // Check for session cookie
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_token_copy")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value

    if (!sessionToken) {
      const signInUrl = new URL("/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Redirect to dashboard if on root and has session
  if (request.nextUrl.pathname === "/") {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_token_copy")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value

    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
