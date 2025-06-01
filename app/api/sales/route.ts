import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: { status: "active" },
        include: {
          customer: true,
          employee: {
            include: {
              info: true,
            },
          },
          saledetails: {
            include: {
              product: true,
            },
          },
          payment: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.count({ where: { status: "active" } }),
    ])

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          employeeId: data.employeeId,
          customerId: data.customerId,
          amount: data.amount,
          memo: data.memo,
          invoice: data.invoice,
        },
      })

      // Create sale details and update stock
      for (const item of data.items) {
        await tx.saledetail.create({
          data: {
            saleId: newSale.saleId,
            productId: item.productId,
            quantity: item.quantity,
            amount: item.amount,
            memo: item.memo,
          },
        })

        // Update stock
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        })

        if (stock) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity: stock.quantity - item.quantity },
          })
        }
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error("Sale creation error:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
