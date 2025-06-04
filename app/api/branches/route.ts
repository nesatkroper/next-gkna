import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { status: "active" },
    })
    return NextResponse.json(branches)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch branches" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.branchName) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 })
    }

    const branch = await prisma.branch.create({
      data: {
        branchName: data.branchName,
        branchCode: data.branchCode || null,
        picture: data.picture || null,
        tel: data.tel || null,
        memo: data.memo || null,
        status: "active",
      },
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create branch" }, { status: 500 })
  }
}