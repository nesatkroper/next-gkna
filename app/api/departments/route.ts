import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const departments = await prisma.department.findMany({
      where: includeInactive ? {} : softDeleteWhere.active,
      include: {
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
      orderBy: { departmentName: "asc" },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Departments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const department = await prisma.department.create({
      data: {
        departmentName: data.departmentName,
        departmentCode: data.departmentCode,
        memo: data.memo,
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error("Department creation error:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
