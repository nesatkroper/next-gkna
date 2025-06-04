import { create } from "zustand"

interface Event {
  eventId: string
  eventName: string
  memo?: string | null
  startDate: string
  endDate: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  Address?: {
    street?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    country?: string | null
  } | null
}

interface EventStore {
  items: Event[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Event>) => Promise<boolean>
  update: (id: string, data: Partial<Event>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useEventStore = create<EventStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/events")
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.events || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch events", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create event")
      }
      const newEvent = await response.json()
      set((state) => ({ items: [...state.items, newEvent] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update event")
      }
      const updatedEvent = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.eventId === id ? updatedEvent : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete event")
      set((state) => ({
        items: state.items.filter((item) => item.eventId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))


// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Event } from "@/lib/generated/prisma"


// export interface CreateEventData {
//   eventName: string
//   memo?: string
//   startDate: Date
//   endDate: Date
// }

// export type EventStore = BaseStore<Event, CreateEventData>

// export const useEventStore = create<EventStore>()(
//   devtools(
//     createBaseStore<Event, CreateEventData>({
//       endpoint: "/api/events",
//       entityName: "events",
//       idField: "eventId",
//     }),
//     { name: "event-store" },
//   ),
// )
