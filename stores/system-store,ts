import { create } from "zustand"

interface System {
  systemId: string
  systemName: string
  systemType: string
  ownerName?: string | null
  ownerEmail?: string | null
  ownerPhone?: string | null
  apiKey: string
  apiSecret: string
  apiUrl: string
  apiVersion: string
  description?: string | null
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface SystemStore {
  items: System[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<System>) => Promise<boolean>
  update: (id: string, data: Partial<System>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useSystemStore = create<SystemStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/systems")
      if (!response.ok) throw new Error("Failed to fetch system records")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.systems || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch system records", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create system record")
      }
      const newSystem = await response.json()
      set((state) => ({ items: [...state.items, newSystem] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/systems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update system record")
      }
      const updatedSystem = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.systemId === id ? updatedSystem : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/systems/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete system record")
      set((state) => ({
        items: state.items.filter((item) => item.systemId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))