import { create } from "zustand"

interface City {
  cityId: number
  stateId: number
  name: string
  State?: { stateId: number; name: string } | null
}

interface CityStore {
  items: City[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<City>) => Promise<boolean>
  update: (id: number, data: Partial<City>) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
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
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch cities", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create city")
      }
      const newCity = await response.json()
      set((state) => ({ items: [...state.items, newCity] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update city")
      }
      const updatedCity = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.cityId === id ? updatedCity : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete city")
      set((state) => ({
        items: state.items.filter((item) => item.cityId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))


// import { create } from "zustand"

// interface City {
//   cityId: number
//   stateId: number
//   name: string
// }

// interface CityStore {
//   items: City[]
//   isLoading: boolean
//   error: string | null
//   fetch: () => Promise<void>
// }

// export const useCityStore = create<CityStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/cities")
//       if (!response.ok) throw new Error("Failed to fetch cities")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.cities || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message || "Failed to fetch cities", isLoading: false })
//     }
//   },
// }))