import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Event {
  eventId: string
  eventName: string
  memo?: string
  startDate: Date
  endDate: Date
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CreateEventData {
  eventName: string
  memo?: string
  startDate: Date
  endDate: Date
}

export type EventStore = BaseStore<Event, CreateEventData>

export const useEventStore = create<EventStore>()(
  devtools(
    createBaseStore<Event, CreateEventData>({
      endpoint: "/api/events",
      entityName: "events",
      idField: "eventId",
    }),
    { name: "event-store" },
  ),
)
