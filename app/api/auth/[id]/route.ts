import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { email, password, roleId, employeeId } = body
    const authId = params.id

    // Validate required fields
    if (!email || !roleId) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Check if email exists for other records
    const existingAuth = await prisma.auth.findFirst({
      where: {
        email,
        authId: { not: authId },
      },
    })

    if (existingAuth) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      email,
      roleId,
      employeeId: employeeId || null,
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update auth record
    const auth = await prisma.auth.update({
      where: { authId },
      data: updateData,
      include: {
        Role: true,
        Employee: true,
      },
    })

    return NextResponse.json(auth)
  } catch (error) {
    console.error("Error updating auth record:", error)
    return NextResponse.json({ error: "Failed to update auth record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authId = params.id

    await prisma.auth.delete({
      where: { authId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting auth record:", error)
    return NextResponse.json({ error: "Failed to delete auth record" }, { status: 500 })
  }
}




// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcrypt"

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params
//     const data = await request.json()

//     // Validate auth exists
//     const existingAuth = await prisma.auth.findUnique({ where: { authId: id } })
//     if (!existingAuth) {
//       return NextResponse.json({ error: "Auth record not found" }, { status: 404 })
//     }

//     // Hash password if provided
//     if (data.password) {
//       data.password = await bcrypt.hash(data.password, 10)
//     } else {
//       delete data.password // Don't update password if not provided
//     }

//     // Validate roleId if provided
//     if (data.roleId) {
//       const role = await prisma.role.findUnique({ where: { roleId: data.roleId } })
//       if (!role) {
//         return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
//       }
//     }

//     // Validate employeeId if provided
//     if (data.employeeId) {
//       const employee = await prisma.employee.findUnique({
//         where: { employeeId: data.employeeId },
//       })
//       if (!employee) {
//         return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
//       }
//     } else if (data.employeeId === "") {
//       data.employeeId = null // Allow clearing employeeId
//     }

//     const auth = await prisma.auth.update({
//       where: { authId: id },
//       data: {
//         email: data.email,
//         password: data.password,
//         roleId: data.roleId,
//         employeeId: data.employeeId,
//       },
//       include: {
//         Employee: { select: { firstName: true, lastName: true } },
//         Role: { select: { name: true } },
//       },
//     })

//     return NextResponse.json(auth)
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       return NextResponse.json(
//         { error: `Duplicate ${error.meta.target.join(", ")}` },
//         { status: 400 }
//       )
//     }
//     return NextResponse.json(
//       { error: error.message || "Failed to update auth record" },
//       { status: 500 }
//     )
//   }
// }

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params
//     const existingAuth = await prisma.auth.findUnique({ where: { authId: id } })
//     if (!existingAuth) {
//       return NextResponse.json({ error: "Auth record not found" }, { status: 404 })
//     }

//     await prisma.auth.delete({ where: { authId: id } })
//     return NextResponse.json({ message: "Auth record deleted successfully" })
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to delete auth record" },
//       { status: 500 }
//     )
//   }
// }