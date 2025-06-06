import { create } from "zustand"

interface Count {
  table_name: string
  count: string
}

interface CountStore {
  items: Count[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useCountStore = create<CountStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/table-counts")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.count || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch brands", isLoading: false })
    }
  },
}))