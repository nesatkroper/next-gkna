import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Security headers for all responses
  const response = NextResponse.next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  )

  // Skip middleware for login page and auth API routes
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/api/auth")) {
    return response
  }

  // Protected routes
  const protectedPaths = ["/dashboard", "/admin"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const token = request.cookies.get("auth-token")?.value

    console.log("Middleware check:", {
      path: request.nextUrl.pathname,
      hasToken: !!token,
      token: token ? "exists" : "missing",
    })

    if (!token) {
      console.log("No token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      console.log("Invalid token, redirecting to login")
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }


    console.log("Token valid, allowing access")
    // Add user info to headers for API routes
    response.headers.set("X-User-ID", decoded.authId)
  }

  return response
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
}



// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import { verifyToken } from "@/lib/auth"

// export function middleware(request: NextRequest) {
//   // Security headers for all responses
//   const response = NextResponse.next()

//   response.headers.set("X-Content-Type-Options", "nosniff")
//   response.headers.set("X-Frame-Options", "DENY")
//   response.headers.set("X-XSS-Protection", "1; mode=block")
//   response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
//   response.headers.set(
//     "Content-Security-Policy",
//     "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
//   )

//   // Protected routes
//   const protectedPaths = ["/dashboard", "/admin", "/api/protected"]
//   const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

//   if (isProtectedPath) {
//     const token = request.cookies.get("auth-token")?.value

//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url))
//     }

//     const decoded = verifyToken(token)
//     if (!decoded) {
//       const response = NextResponse.redirect(new URL("/login", request.url))
//       response.cookies.delete("auth-token")
//       return response
//     }

//     // Add user info to headers for API routes
//     response.headers.set("X-User-ID", decoded.authId)
//   }

//   return response
// }

// export const config = {
//   matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
// }




// // // middleware.ts
// // import { NextResponse } from 'next/server';
// // import type { NextRequest } from 'next/server';
// // import { verifyToken } from './lib/auth';

// // const PUBLIC_ROUTES = ['/', '/login', '/register'];
// // const AUTH_ROUTES = ['/dashboard', '/account'];

// // export async function middleware(request: NextRequest) {
// //   const path = request.nextUrl.pathname;
// //   const token = request.cookies.get('token')?.value;

// //   // Redirect logged-in users away from auth pages
// //   if (PUBLIC_ROUTES.includes(path) && token) {
// //     const isValid = verifyToken(token);
// //     if (isValid) {
// //       return NextResponse.redirect(new URL('/dashboard', request.url));
// //     }
// //   }

// //   // Protect auth routes
// //   if (AUTH_ROUTES.some(route => path.startsWith(route))) {
// //     if (!token) {
// //       return NextResponse.redirect(new URL('/login', request.url));
// //     }

// //     const isValid = verifyToken(token);
// //     if (!isValid) {
// //       const response = NextResponse.redirect(new URL('/login', request.url));
// //       response.cookies.delete('token');
// //       return response;
// //     }

// //     // Add security headers for authenticated routes
// //     const response = NextResponse.next();
// //     response.headers.set('X-Content-Type-Options', 'nosniff');
// //     response.headers.set('X-Frame-Options', 'DENY');
// //     response.headers.set('X-XSS-Protection', '1; mode=block');
// //     return response;
// //   }

// //   return NextResponse.next();
// // }