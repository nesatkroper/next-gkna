import { create } from "zustand"

interface Brand {
  brandId: string
  brandName: string
  brandCode?: string | null
  picture?: string | null
  memo?: string | null
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface BrandStore {
  items: Brand[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Brand>) => Promise<boolean>
  update: (id: string, data: Partial<Brand>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useBrandStore = create<BrandStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/brands")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.brands || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch brands", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: 'no-store'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create brand")
      }
      const newBrand = await response.json()
      set((state) => ({ items: [...state.items, newBrand] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update brand")
      }
      const updatedBrand = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.brandId === id ? updatedBrand : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete brand")
      set((state) => ({
        items: state.items.filter((item) => item.brandId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))