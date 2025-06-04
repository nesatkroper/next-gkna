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
  create: (data: Partial<State>) => Promise<boolean>
  update: (id: number, data: Partial<State>) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
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
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch states", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create state")
      }
      const newState = await response.json()
      set((state) => ({ items: [...state.items, newState] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/states/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update state")
      }
      const updatedState = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.stateId === id ? updatedState : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/states/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete state")
      set((state) => ({
        items: state.items.filter((item) => item.stateId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))

// import { create } from "zustand"

// interface State {
//   stateId: number
//   name: string
// }

// interface StateStore {
//   items: State[]
//   isLoading: boolean
//   error: string | null
//   fetch: () => Promise<void>
// }

// export const useStateStore = create<StateStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/states")
//       if (!response.ok) throw new Error("Failed to fetch states")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.states || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message || "Failed to fetch states", isLoading: false })
//     }
//   },
// }))