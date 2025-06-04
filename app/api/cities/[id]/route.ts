import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()

    const existingCity = await prisma.city.findUnique({ where: { cityId: id } })
    if (!existingCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    if (data.name === "") {
      return NextResponse.json({ error: "City name cannot be empty" }, { status: 400 })
    }
    if (data.stateId) {
      const state = await prisma.state.findUnique({ where: { stateId: data.stateId } })
      if (!state) {
        return NextResponse.json({ error: "State not found" }, { status: 404 })
      }
    }

    const updatedCity = await prisma.city.update({
      where: { cityId: id },
      data: {
        name: data.name || undefined,
        stateId: data.stateId || undefined,
      },
      include: { State: { select: { stateId: true, name: true } } },
    })

    return NextResponse.json(updatedCity)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update city" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const existingCity = await prisma.city.findUnique({ where: { cityId: id } })
    if (!existingCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    await prisma.city.delete({ where: { cityId: id } })
    return NextResponse.json({ message: "City deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete city" }, { status: 500 })
  }
}