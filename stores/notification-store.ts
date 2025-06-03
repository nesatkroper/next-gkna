import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Notification {
  notificationId: string
  authId?: string
  userId?: string
  title: string
  content: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CreateNotificationData {
  authId?: string
  userId?: string
  title: string
  content: string
}

export type NotificationStore = BaseStore<Notification, CreateNotificationData> & {
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  unreadCount: number
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      ...createBaseStore<Notification, CreateNotificationData>({
        endpoint: "/api/notifications",
        entityName: "notifications",
        idField: "notificationId",
      })(set, get),

      // Computed property for unread count
      unreadCount: 0,

      // Custom methods
      markAsRead: async (notificationId: string) => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: "PUT",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to mark notification as read")
          }

          const updatedNotification = await response.json()

          set((state) => ({
            items: state.items.map((item) => (item.notificationId === notificationId ? updatedNotification : item)),
            unreadCount: state.unreadCount - 1,
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

      markAllAsRead: async () => {
        set({ isUpdating: true, error: null })

        try {
          const response = await fetch("/api/notifications/read-all", {
            method: "PUT",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to mark all notifications as read")
          }

          const updatedNotifications = await response.json()

          set({
            items: updatedNotifications,
            unreadCount: 0,
            isUpdating: false,
          })

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
    { name: "notification-store" },
  ),
)
