import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes and their required roles
const protectedRoutes = {
  "/dashboard": ["admin", "manager"],
  "/admin": ["admin"],
  "/reports": ["admin", "manager"],
  "/profile": ["admin", "manager", "staff", "user"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path requires authentication
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) => pathname.startsWith(route))?.[1]

  if (!requiredRoles) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const token = request.cookies.get("auth-token")

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {

    const userRole = getUserRoleFromToken(token.value)
    const userStatus = getUserStatusFromToken(token.value)


    if (userStatus !== "active") {
      return NextResponse.redirect(new URL("/account-suspended", request.url))
    }

    if (!requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// Mock functions - replace with actual JWT verification
function getUserRoleFromToken(token: string): string {
  // This would decode and verify your JWT
  return "staff" // Mock return
}

function getUserStatusFromToken(token: string): string {
  // This would decode and verify your JWT
  return "active" // Mock return
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/reports/:path*", "/profile/:path*"],
}
