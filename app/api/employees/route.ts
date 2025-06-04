


import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"
import { generateEmployeeCode } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const departmentId = searchParams.get("departmentId")
    const includeInactive = searchParams.get("includeInactive") === "true"

    const skip = (page - 1) * limit

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { employeeCode: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(departmentId && { departmentId }),
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          Department: true,
          Position: true,
          Employeeinfo: true,
          Address: {
            include: {
              City: true,
              State: true,
            },
          },
          _count: {
            select: {
              Sale: true,
              Attendance: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Employees fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const employee = await prisma.$transaction(async (tx) => {
      const employeeCode = generateEmployeeCode()
      const newEmployee = await tx.employee.create({
        data: {
          employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || "male",
          dob: data.dob ? new Date(data.dob) : null,
          phone: data.phone,
          positionId: data.positionId,
          departmentId: data.departmentId,
          salary: data.salary,
          hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })

      // Create employee info if provided
      if (data.email || data.region || data.note) {
        await tx.employeeinfo.create({
          data: {
            employeeId: newEmployee.employeeId,
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
        })
      }

      return newEmployee
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Employee creation error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}


// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET() {
//   try {
//     const employees = await prisma.employee.findMany({
//       where: { status: "active" },
//       include: {
//         Department: { select: { departmentId: true, name: true } },
//         Position: { select: { positionId: true, name: true } },
//         Branch: { select: { branchId: true, branchName: true } },
//       },
//     })
//     return NextResponse.json(employees)
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message || "Failed to fetch employees" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const data = await request.json()

//     if (!data.firstName || !data.lastName || !data.positionId || !data.departmentId || !data.salary) {
//       return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
//     }

//     const position = await prisma.position.findUnique({ where: { positionId: data.positionId } })
//     if (!position) return NextResponse.json({ error: "Position not found" }, { status: 404 })

//     const department = await prisma.department.findUnique({ where: { departmentId: data.departmentId } })
//     if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 })

//     if (data.branchId) {
//       const branch = await prisma.branch.findUnique({ where: { branchId: data.branchId } })
//       if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 })
//     }

//     const employee = await prisma.employee.create({
//       data: {
//         employeeCode: data.employeeCode || null,
//         firstName: data.firstName,
//         lastName: data.lastName,
//         gender: data.gender || "male",
//         dob: data.dob ? new Date(data.dob) : null,
//         phone: data.phone || null,
//         positionId: data.positionId,
//         branchId: data.branchId || null,
//         departmentId: data.departmentId,
//         salary: data.salary,
//         hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
//         status: "active",
//         updatedAt: new Date(),
//       },
//       include: {
//         Department: { select: { departmentId: true, name: true } },
//         Position: { select: { positionId: true, name: true } },
//         Branch: { select: { branchId: true, branchName: true } },
//       },
//     })

//     return NextResponse.json(employee, { status: 201 })
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       return NextResponse.json(
//         { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
//         { status: 400 }
//       )
//     }
//     return NextResponse.json({ error: error.message || "Failed to create employee" }, { status: 500 })
//   }
// }