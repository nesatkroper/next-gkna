import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { softDelete } from "@/lib/soft-delete"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { categoryId: params.id },
      include: {
        products: {
          include: {
            stocks: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Category fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const category = await prisma.category.update({
      where: { categoryId: params.id },
      data: {
        categoryName: data.categoryName,
        categoryCode: data.categoryCode,
        picture: data.picture,
        memo: data.memo,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id, status: "active" },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with active products. Please reassign or delete products first." },
        { status: 400 },
      )
    }

    const category = await prisma.category.update({
      where: { categoryId: params.id },
      data: softDelete.delete,
    })

    return NextResponse.json({ message: "Category deleted successfully", category })
  } catch (error) {
    console.error("Category delete error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
