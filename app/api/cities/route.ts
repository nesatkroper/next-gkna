import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      include: { State: { select: { stateId: true, name: true } } },
    })
    return NextResponse.json(cities)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch cities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ error: "City name is required" }, { status: 400 })
    }
    if (!data.stateId) {
      return NextResponse.json({ error: "State ID is required" }, { status: 400 })
    }

    const state = await prisma.state.findUnique({ where: { stateId: data.stateId } })
    if (!state) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    const city = await prisma.city.create({
      data: {
        name: data.name,
        stateId: data.stateId,
      },
      include: { State: { select: { stateId: true, name: true } } },
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create city" }, { status: 500 })
  }
}