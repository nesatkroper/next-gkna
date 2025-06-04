import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const states = await prisma.state.findMany()
    return NextResponse.json(states)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch states" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ error: "State name is required" }, { status: 400 })
    }

    const state = await prisma.state.create({
      data: {
        name: data.name,
      },
    })

    return NextResponse.json(state, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create state" }, { status: 500 })
  }
}