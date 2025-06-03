import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Event } from "@/lib/generated/prisma"


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
