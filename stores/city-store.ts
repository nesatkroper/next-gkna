import { create } from "zustand"

interface City {
  cityId: number
  stateId: number
  name: string
}

interface CityStore {
  items: City[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useCityStore = create<CityStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/cities")
      if (!response.ok) throw new Error("Failed to fetch cities")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.cities || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch cities", isLoading: false })
    }
  },
}))