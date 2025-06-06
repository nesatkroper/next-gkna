import { create } from "zustand"

interface Address {
  addressId: string
  cityId?: number | null
  stateId?: number | null
  latitude?: number | null
  longitude?: number | null
  customerId?: string | null
  employeeId?: string | null
  supplierId?: string | null
  eventId?: string | null
  createdAt: string
  updatedAt: string
  status: "active" | "inactive"
  City?: { cityId: number; name: string } | null
  State?: { stateId: number; name: string } | null
}

interface AddressStore {
  items: Address[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Address>) => Promise<boolean>
  update: (id: string, data: Partial<Address>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useAddressStore = create<AddressStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/addresses")
      if (!response.ok) throw new Error("Failed to fetch addresses")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.addresses || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch addresses", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create address")
      }
      const newAddress = await response.json()
      set((state) => ({ items: [...state.items, newAddress] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update address")
      }
      const updatedAddress = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.addressId === id ? updatedAddress : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete address")
      set((state) => ({
        items: state.items.filter((item) => item.addressId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))


// import { Address } from "@/lib/generated/prisma"
// import { create } from "zustand"


// interface AddressStore {
//   items: Address[]
//   isLoading: boolean
//   error: string | null
//   fetch: () => Promise<void>
//   create: (data: Partial<Address>) => Promise<boolean>
//   update: (id: string, data: Partial<Address>) => Promise<boolean>
//   delete: (id: string) => Promise<boolean>
// }

// export const useAddressStore = create<AddressStore>((set) => ({
//   items: [],
//   isLoading: false,
//   error: null,
//   fetch: async () => {
//     set({ isLoading: true, error: null })
//     try {
//       const response = await fetch("/api/addresses")
//       if (!response.ok) throw new Error("Failed to fetch addresses")
//       const data = await response.json()
//       set({ items: Array.isArray(data) ? data : data?.addresses || [], isLoading: false })
//     } catch (error) {
//       set({ error: error.message, isLoading: false })
//     }
//   },
//   create: async (data) => {
//     try {
//       const response = await fetch("/api/addresses", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) throw new Error("Failed to create address")
//       const newAddress = await response.json()
//       set((state) => ({ items: [...state.items, newAddress] }))
//       return true
//     } catch (error) {
//       console.error("Create address error:", error)
//       return false
//     }
//   },
//   update: async (id, data) => {
//     try {
//       const response = await fetch(`/ api / addresses / ${id} `, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
//       if (!response.ok) throw new Error("Failed to update address")
//       const updatedAddress = await response.json()
//       set((state) => ({
//         items: state.items.map((item) =>
//           item.addressId === id ? updatedAddress : item,
//         ),
//       }))
//       return true
//     } catch (error) {
//       console.error("Update address error:", error)
//       return false
//     }
//   },
//   delete: async (id) => {
//     try {
//       const response = await fetch(`/ api / addresses / ${id} `, {
//         method: "DELETE",
//       })
//       if (!response.ok) throw new Error("Failed to delete address")
//       set((state) => ({
//         items: state.items.filter((item) => item.addressId !== id),
//       }))
//       return true
//     } catch (error) {
//       console.error("Delete address error:", error)
//       return false
//     }
//   },
// }))