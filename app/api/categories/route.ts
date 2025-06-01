import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: "active" },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { categoryName: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}



const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  categoryCode: z.string().optional(),
  picture: z.string().url().optional(),
  memo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const data = categorySchema.parse(await request.json());

    const category = await prisma.category.create({
      data: {
        categoryName: data.categoryName,
        categoryCode: data.categoryCode,
        picture: data.picture,
        memo: data.memo,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Category creation error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}