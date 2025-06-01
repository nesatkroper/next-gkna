import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const auth = await prisma.auth.findUnique({
      where: { email },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    if (!auth || !(await verifyPassword(password, auth.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (auth.status !== "active") {
      return NextResponse.json({ error: "Account is not active" }, { status: 401 })
    }

    const token = generateToken(auth.authId)

    // Update last login
    await prisma.auth.update({
      where: { authId: auth.authId },
      data: { lastLoginAt: new Date() },
    })

    // Store token in database
    await prisma.token.create({
      data: {
        authId: auth.authId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceInfo: request.headers.get("user-agent") || "",
        ipAddress: request.ip || "",
      },
    })

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        authId: auth.authId,
        email: auth.email,
        role: auth.role.name,
        employee: auth.employee,
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
