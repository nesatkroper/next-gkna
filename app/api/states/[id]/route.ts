import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()

    const existingState = await prisma.state.findUnique({ where: { stateId: id } })
    if (!existingState) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    if (data.name === "") {
      return NextResponse.json({ error: "State name cannot be empty" }, { status: 400 })
    }

    const updatedState = await prisma.state.update({
      where: { stateId: id },
      data: {
        name: data.name || undefined,
      },
    })

    return NextResponse.json(updatedState)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update state" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const existingState = await prisma.state.findUnique({ where: { stateId: id } })
    if (!existingState) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    await prisma.state.delete({ where: { stateId: id } })
    return NextResponse.json({ message: "State deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete state" }, { status: 500 })
  }
}