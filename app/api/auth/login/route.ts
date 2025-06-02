import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  // const userAgent = request.headers.get("user-agent") || ""

  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim()

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Find user
    const auth = await prisma.auth.findUnique({
      where: { email: sanitizedEmail },
      include: {
        Role: true,
        Employee: {
          include: {
            Department: true,
            Position: true,
            Employeeinfo: true,
          },
        },
      },
    })

    // Log failed attempt if user not found
    if (!auth) {
      console.log("User not found:", sanitizedEmail)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check account status
    if (auth.status !== "active") {
      console.log("Account not active:", sanitizedEmail)
      return NextResponse.json({ error: "Account is not active" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, auth.password)
    if (!isValidPassword) {
      console.log("Invalid password for:", sanitizedEmail)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate secure token
    const token = await generateToken(auth.authId)

    console.log("Generated token for:", sanitizedEmail)

    // Update last login
    await prisma.auth.update({
      where: { authId: auth.authId },
      data: { lastLoginAt: new Date() },
    })

    console.log("Login successful for:", sanitizedEmail)

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        authId: auth.authId,
        email: auth.email,
        role: auth.Role?.name,
        employee: auth.Employee,
      },
    })

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    console.log("Cookie set for:", sanitizedEmail)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { verifyPassword, generateToken, hashPassword } from "@/lib/auth"
// import { rateLimit } from "@/lib/rate-limit"
// import { logSecurityEvent } from "@/lib/security-logger"

// // Rate limiting: 5 attempts per 15 minutes per IP
// const limiter = rateLimit({
//   interval: 15 * 60 * 1000, // 15 minutes
//   uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
// })

// export async function POST(request: NextRequest) {
//   const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
//   const userAgent = request.headers.get("user-agent") || ""

//   try {
//     // Rate limiting
//     try {
//       await limiter.check(5, ip) // 5 requests per interval
//     } catch {
//       await logSecurityEvent({
//         type: "RATE_LIMIT_EXCEEDED",
//         ip,
//         userAgent,
//         details: "Login rate limit exceeded",
//       })
//       return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
//     }

//     // CSRF protection
//     const csrfHeader = request.headers.get("X-Requested-With")
//     if (csrfHeader !== "XMLHttpRequest") {
//       await logSecurityEvent({
//         type: "CSRF_VIOLATION",
//         ip,
//         userAgent,
//         details: "Missing or invalid CSRF header",
//       })
//       return NextResponse.json({ error: "Invalid request" }, { status: 403 })
//     }

//     const body = await request.json()
//     const { email, password, timestamp } = body

//     // Input validation
//     if (!email || !password || !timestamp) {
//       return NextResponse.json({ error: "Email, password, and timestamp are required" }, { status: 400 })
//     }

//     // Replay attack protection (request must be within 5 minutes)
//     const now = Date.now()
//     if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
//       await logSecurityEvent({
//         type: "REPLAY_ATTACK",
//         ip,
//         userAgent,
//         email,
//         details: "Request timestamp outside acceptable range",
//       })
//       return NextResponse.json({ error: "Request expired" }, { status: 400 })
//     }

//     // Sanitize email
//     const sanitizedEmail = email.toLowerCase().trim()

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(sanitizedEmail)) {
//       return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
//     }

//     // Check for recent failed attempts
//     const recentFailedAttempts = await prisma.authLog.count({
//       where: {
//         ip,
//         status: 401,
//         url: "/api/auth/login",
//         createdAt: {
//           gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
//         },
//       },
//     })

//     if (recentFailedAttempts >= 5) {
//       await logSecurityEvent({
//         type: "ACCOUNT_LOCKED",
//         ip,
//         userAgent,
//         email: sanitizedEmail,
//         details: "Account locked due to multiple failed attempts",
//       })
//       return NextResponse.json({ error: "Account temporarily locked. Please try again later." }, { status: 423 })
//     }

//     // Find user
//     const auth = await prisma.auth.findUnique({
//       where: { email: sanitizedEmail },
//       include: {
//         Role: true,
//         Employee: {
//           include: {
//             Department: true,
//             Position: true,
//           },
//         },
//       },
//     })

//     // Log failed attempt if user not found
//     if (!auth) {
//       await prisma.authLog.create({
//         data: {
//           authId: "00000000-0000-0000-0000-000000000000", // Use a default UUID for non-existent users
//           method: "POST",
//           url: "/api/auth/login",
//           status: 401,
//           responseTime: 0,
//           ip,
//           userAgent,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//       })

//       await logSecurityEvent({
//         type: "LOGIN_FAILED",
//         ip,
//         userAgent,
//         email: sanitizedEmail,
//         details: "User not found",
//       })

//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Check account status
//     if (auth.status !== "active") {
//       await prisma.authLog.create({
//         data: {
//           authId: auth.authId,
//           method: "POST",
//           url: "/api/auth/login",
//           status: 401,
//           responseTime: 0,
//           ip,
//           userAgent,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//       })

//       await logSecurityEvent({
//         type: "LOGIN_FAILED",
//         ip,
//         userAgent,
//         email: sanitizedEmail,
//         details: "Account not active",
//       })

//       return NextResponse.json({ error: "Account is not active" }, { status: 401 })
//     }

//     // Verify password
//     const isValidPassword = await verifyPassword(password, auth.password)
//     if (!isValidPassword) {
//       await prisma.authLog.create({
//         data: {
//           authId: auth.authId,
//           method: "POST",
//           url: "/api/auth/login",
//           status: 401,
//           responseTime: 0,
//           ip,
//           userAgent,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//       })

//       await logSecurityEvent({
//         type: "LOGIN_FAILED",
//         ip,
//         userAgent,
//         email: sanitizedEmail,
//         details: "Invalid password",
//       })

//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Generate secure token
//     const token = generateToken(auth.authId)

//     // Update last login
//     await prisma.auth.update({
//       where: { authId: auth.authId },
//       data: { lastLoginAt: new Date() },
//     })

//     // Store token in database with enhanced security
//     await prisma.token.create({
//       data: {
//         authId: auth.authId,
//         token: await hashPassword(token), // Hash the token in database
//         expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
//         deviceInfo: userAgent,
//         ipAddress: ip,
//       },
//     })

//     // Log successful login
//     await prisma.authLog.create({
//       data: {
//         authId: auth.authId,
//         method: "POST",
//         url: "/api/auth/login",
//         status: 200,
//         responseTime: Date.now() - timestamp, // Calculate response time
//         ip,
//         userAgent,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//     })

//     await logSecurityEvent({
//       type: "LOGIN_SUCCESS",
//       ip,
//       userAgent,
//       email: sanitizedEmail,
//       userId: auth.authId,
//       details: "Successful login",
//     })

//     const response = NextResponse.json({
//       message: "Login successful",
//       user: {
//         authId: auth.authId,
//         email: auth.email,
//         role: auth.Role.name,
//         employee: auth.Employee,
//       },
//     })

//     // Set secure HTTP-only cookie
//     response.cookies.set("auth-token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       // sameSite: "strict",
//       sameSite: "lax",
//       maxAge: 8 * 60 * 60, // 8 hours
//       path: "/",
//     })

//     // Security headers
//     response.headers.set("X-Content-Type-Options", "nosniff")
//     response.headers.set("X-Frame-Options", "DENY")
//     response.headers.set("X-XSS-Protection", "1; mode=block")

//     return response
//   } catch (error) {
//     console.error("Login error:", error)

//     await logSecurityEvent({
//       type: "SYSTEM_ERROR",
//       ip,
//       userAgent,
//       details: "Login system error",
//     })

//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



