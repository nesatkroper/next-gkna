import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const includeInactive = searchParams.get("includeInactive") === "true"

    const skip = (page - 1) * limit

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { info: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          Address: {
            include: {
              City: true,
              State: true,
            },
          },
          Customerinfo: true,
          Employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              Sale: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const customer = await prisma.$transaction(async (tx) => {
      // Create customer
      const newCustomer = await tx.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || "male",
          phone: data.phone,
          employeeId: data.employeeId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })

      // Create customer info if provided
      if (data.email || data.region || data.note || data.govId) {
        await tx.customerinfo.create({
          data: {
            customerId: newCustomer.customerId,
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
        })
      }

      // Create address if provided
      if (data.cityId || data.stateId) {
        await tx.address.create({
          data: {
            customerId: newCustomer.customerId,
            cityId: data.cityId,
            stateId: data.stateId,
            latitude: data.latitude,
            longitude: data.longitude,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        })
      }

      return newCustomer
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
