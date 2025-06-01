import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const attendance = await prisma.attendance.update({
      where: { attendanceId: params.id },
      data: {
        checkIn: data.checkIn ? new Date(`${data.attendanceDate}T${data.checkIn}`) : null,
        checkOut: data.checkOut ? new Date(`${data.attendanceDate}T${data.checkOut}`) : null,
        status: data.status,
        note: data.note,
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Attendance update error:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.attendance.delete({
      where: { attendanceId: params.id },
    })

    return NextResponse.json({ message: "Attendance record deleted successfully" })
  } catch (error) {
    console.error("Attendance delete error:", error)
    return NextResponse.json({ error: "Failed to delete attendance record" }, { status: 500 })
  }
}
