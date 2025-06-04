import { create } from "zustand"

interface Sale {
  saleId: string
  employeeId: string
  customerId: string
  saleDate: string
  amount: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  memo?: string | null
  invoice?: string | null
  Employee?: { employeeId: string; firstName: string; lastName: string } | null
  Customer?: { customerId: string; firstName: string; lastName: string } | null
}

interface SaleStore {
  items: Sale[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Sale>) => Promise<boolean>
  update: (id: string, data: Partial<Sale>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useSaleStore = create<SaleStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/sales")
      if (!response.ok) throw new Error("Failed to fetch sales")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.sales || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch sales", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create sale")
      }
      const newSale = await response.json()
      set((state) => ({ items: [...state.items, newSale] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update sale")
      }
      const updatedSale = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.saleId === id ? updatedSale : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete sale")
      set((state) => ({
        items: state.items.filter((item) => item.saleId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))


// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Sale, Saledetail } from "@/lib/generated/prisma"


// export interface CreateSaleData {
//   employeeId: string
//   customerId: string
//   saleDate?: Date
//   amount: number
//   memo?: string
//   invoice?: string
//   details: Array<{
//     productId: string
//     quantity: number
//     amount: number
//     memo?: string
//   }>
// }

// export type SaleStore = BaseStore<Sale, CreateSaleData> & {
//   saleDetails: Saledetail[]
//   fetchSaleDetails: (saleId: string) => Promise<void>
//   isLoadingSaleDetails: boolean
//   saleDetailsError: string | null
// }

// export const useSaleStore = create<SaleStore>()(
//   devtools(
//     (set, get) => ({
//       ...createBaseStore<Sale, CreateSaleData>({
//         endpoint: "/api/sales",
//         entityName: "sales",
//         idField: "saleId",
//       })(set, get),

//       // Additional state for sale details
//       saleDetails: [],
//       isLoadingSaleDetails: false,
//       saleDetailsError: null,

//       // Custom method to fetch sale details
//       fetchSaleDetails: async (saleId: string) => {
//         set({ isLoadingSaleDetails: true, saleDetailsError: null })

//         try {
//           const response = await fetch(`/api/sales/${saleId}/details`)
//           if (!response.ok) throw new Error("Failed to fetch sale details")

//           const data = await response.json()
//           const details = Array.isArray(data) ? data : data.details || []

//           set({ saleDetails: details, isLoadingSaleDetails: false })
//         } catch (error: unknown) {
//           const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
//           set({
//             saleDetailsError: errorMessage,
//             isLoadingSaleDetails: false,
//           })
//         }
//       },
//     }),
//     { name: "sale-store" },
//   ),
// )
