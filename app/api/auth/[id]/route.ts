import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = 'nodejs';
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


