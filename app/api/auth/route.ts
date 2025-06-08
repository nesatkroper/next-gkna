import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"



export async function GET() {
  try {
    const auths = await prisma.auth.findMany({
      include: {
        Role: true,
        Employee: {
          include: {
            Branch: true
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(auths)
  } catch (error) {
    console.error("Error fetching auth records:", error)
    return NextResponse.json({ error: "Failed to fetch auth records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, roleId, employeeId } = body

    // Validate required fields
    if (!email || !password || !roleId) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingAuth = await prisma.auth.findUnique({
      where: { email },
    })

    if (existingAuth) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create auth record
    const auth = await prisma.auth.create({
      data: {
        email,
        password: hashedPassword,
        roleId,
        employeeId: employeeId || null,
        status: "active",
      },
      include: {
        Role: true,
        Employee: true,
      },
    })

    return NextResponse.json(auth, { status: 201 })
  } catch (error) {
    console.error("Error creating auth record:", error)
    return NextResponse.json({ error: "Failed to create auth record" }, { status: 500 })
  }
}
