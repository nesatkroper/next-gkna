import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Attendance } from "@/lib/generated/prisma"


export interface CreateAttendanceData {
  employeeId: string
  datetime?: Date
  note?: string
  checkIn?: Date
  checkOut?: Date
  eventId: string
  method?: string
}

export type AttendanceStore = BaseStore<Attendance, CreateAttendanceData> & {
  checkIn: (employeeId: string, eventId: string, note?: string) => Promise<boolean>
  checkOut: (attendanceId: string) => Promise<boolean>
}

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    (set, get) => ({
      ...createBaseStore<Attendance, CreateAttendanceData>({
        endpoint: "/api/attendances",
        entityName: "attendances",
        idField: "attendanceId",
      })(set, get),

      // Custom method for check-in
      checkIn: async (employeeId: string, eventId: string, note?: string) => {
        set({ isCreating: true, error: null })

        try {
          const response = await fetch("/api/attendances/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId,
              eventId,
              note,
              checkIn: new Date(),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to check in")
          }

          const newAttendance = await response.json()

          set((state) => ({
            items: [newAttendance, ...state.items],
            isCreating: false,
          }))

          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isCreating: false,
          })
          return false
        }
      },

      // Custom method for check-out
      checkOut: async (attendanceId: string) => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch(`/api/attendances/${attendanceId}/check-out`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkOut: new Date(),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to check out")
          }

          const updatedAttendance = await response.json()

          set((state) => ({
            items: state.items.map((item) => (item.attendanceId === attendanceId ? updatedAttendance : item)),
            isUpdating: false,
          }))

          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            error: errorMessage,
            isUpdating: false,
          })
          return false
        }
      },
    }),
    { name: "attendance-store" },
  ),
)
