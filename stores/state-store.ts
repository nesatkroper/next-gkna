import { create } from "zustand"

interface State {
  stateId: number
  name: string
}

interface StateStore {
  items: State[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useStateStore = create<StateStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/states")
      if (!response.ok) throw new Error("Failed to fetch states")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.states || [], isLoading: false })
    } catch (error) {
      set({ error: error.message || "Failed to fetch states", isLoading: false })
    }
  },
}))