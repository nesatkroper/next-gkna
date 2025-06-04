import { create } from "zustand"

interface Auth {
  authId: string
  email: string
  roleId: string
  employeeId?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  status: "active" | "inactive"
  Employee?: {
    firstName: string
    lastName: string
  }
  Role?: {
    roleName: string
  }
}

interface AuthenticationStore {
  items: Auth[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Auth>) => Promise<boolean>
  update: (id: string, data: Partial<Auth>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useAuthenticationStore = create<AuthenticationStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/auth")
      if (!response.ok) throw new Error("Failed to fetch auth records")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.auths || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch auth records", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create auth record")
      }
      const newAuth = await response.json()
      set((state) => ({ items: [...state.items, newAuth] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/auth/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update auth record")
      }
      const updatedAuth = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.authId === id ? updatedAuth : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/auth/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete auth record")
      set((state) => ({
        items: state.items.filter((item) => item.authId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))