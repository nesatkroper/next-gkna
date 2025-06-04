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
          { supplierName: { contains: search, mode: "insensitive" as const } },
          { companyName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          Address: {
            include: {
              City: true,
              State: true,
            },
          },
          _count: {
            select: {
              entry: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ])

    return NextResponse.json({
      suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Suppliers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const supplier = await prisma.supplier.create({
      data: {
        supplierName: data.supplierName,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error("Supplier creation error:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
