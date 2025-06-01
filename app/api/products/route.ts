import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")

    const skip = (page - 1) * limit

    const where = {
      status: "active" as const,
      ...(search && {
        OR: [
          { productName: { contains: search, mode: "insensitive" as const } },
          { productCode: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          Category: true,
          Stock: true,
          _count: {
            select: {
              Saledetail: true,
              Stockentry: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    // Transform the data to match the expected format
    const transformedProducts = products.map((product) => ({
      ...product,
      category: {
        categoryName: product.Category.categoryName,
      },
      stocks: product.Stock
        ? {
          quantity: product.Stock.quantity,
        }
        : { quantity: 0 },
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.productName || !data.categoryId) {
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 })
    }

    // Convert string numbers to proper types
    const productData = {
      productName: data.productName,
      productCode: data.productCode || null,
      categoryId: data.categoryId,
      picture: data.picture || null,
      unit: data.unit || null,
      capacity: data.capacity || null,
      sellPrice: data.sellPrice ? Number.parseFloat(data.sellPrice) : 0,
      costPrice: data.costPrice ? Number.parseFloat(data.costPrice) : 0,
      discountRate: data.discountRate ? Number.parseInt(data.discountRate) : 0,
      desc: data.desc || null,
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        Category: true,
      },
    })

    // Create initial stock record
    await prisma.stock.create({
      data: {
        productId: product.productId,
        quantity: 0,
      },
    })

    // Transform response to match expected format
    const transformedProduct = {
      ...product,
      category: {
        categoryName: product.Category.categoryName,
      },
    }

    return NextResponse.json(transformedProduct, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Product code already exists" }, { status: 409 })
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
