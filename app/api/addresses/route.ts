import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const addresses = await prisma.address.findMany({
      include: {
        City: true,
        State: true,
        Customer: true,
        Employee: true,
        supplier: true,
        Event: true,
        Imageaddress: { select: { id: true } },
      },
    })
    return NextResponse.json(addresses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}