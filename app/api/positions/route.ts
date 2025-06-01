import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")
    const includeInactive = searchParams.get("includeInactive") === "true"

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(departmentId && { departmentId }),
    }

    const positions = await prisma.position.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { positionName: "asc" },
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Positions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const position = await prisma.position.create({
      data: {
        departmentId: data.departmentId,
        positionName: data.positionName,
        positionCode: data.positionCode,
        memo: data.memo,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error("Position creation error:", error)
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 })
  }
}
