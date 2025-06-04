import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"



export async function GET() {
  try {
    const auths = await prisma.auth.findMany({
      include: {
        Role: true,
        Employee: true,
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


// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcrypt"

// export async function GET() {
//   try {
//     const auths = await prisma.auth.findMany({
//       where: { status: "active" },
//       include: {
//         Employee: { select: { firstName: true, lastName: true } },
//         Role: { select: { name: true } },
//       },
//     })
//     return NextResponse.json(auths)
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to fetch auth records" },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const data = await request.json()
//     if (!data.email || !data.roleId) {
//       return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
//     }

//     // Hash password if provided
//     if (data.password) {
//       data.password = await bcrypt.hash(data.password, 10)
//     } else {
//       return NextResponse.json({ error: "Password is required" }, { status: 400 })
//     }

//     // Validate roleId exists
//     const role = await prisma.role.findUnique({ where: { roleId: data.roleId } })
//     if (!role) {
//       return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
//     }

//     // Validate employeeId if provided
//     if (data.employeeId) {
//       const employee = await prisma.employee.findUnique({
//         where: { employeeId: data.employeeId },
//       })
//       if (!employee) {
//         return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
//       }
//     }

//     const auth = await prisma.auth.create({
//       data: {
//         email: data.email,
//         password: data.password,
//         roleId: data.roleId,
//         employeeId: data.employeeId || null,
//         status: "active",
//       },
//       include: {
//         Employee: { select: { firstName: true, lastName: true } },
//         Role: { select: { name: true } },
//       },
//     })

//     return NextResponse.json(auth, { status: 201 })
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       return NextResponse.json(
//         { error: `Duplicate ${error.meta.target.join(", ")}` },
//         { status: 400 }
//       )
//     }
//     return NextResponse.json(
//       { error: error.message || "Failed to create auth record" },
//       { status: 500 }
//     )
//   }
// }