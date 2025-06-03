import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Sale {
  saleId: string
  employeeId: string
  customerId: string
  saleDate: Date
  amount: number
  status: "active" | "inactive" | "pending"
  createdAt: Date
  updatedAt: Date
  memo?: string
  invoice?: string
}

export interface SaleDetail {
  saledetailId: string
  saleId: string
  productId: string
  quantity: number
  amount: number
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
  memo?: string
}

export interface CreateSaleData {
  employeeId: string
  customerId: string
  saleDate?: Date
  amount: number
  memo?: string
  invoice?: string
  details: Array<{
    productId: string
    quantity: number
    amount: number
    memo?: string
  }>
}

export type SaleStore = BaseStore<Sale, CreateSaleData> & {
  saleDetails: SaleDetail[]
  fetchSaleDetails: (saleId: string) => Promise<void>
  isLoadingSaleDetails: boolean
  saleDetailsError: string | null
}

export const useSaleStore = create<SaleStore>()(
  devtools(
    (set, get) => ({
      ...createBaseStore<Sale, CreateSaleData>({
        endpoint: "/api/sales",
        entityName: "sales",
        idField: "saleId",
      })(set, get),

      // Additional state for sale details
      saleDetails: [],
      isLoadingSaleDetails: false,
      saleDetailsError: null,

      // Custom method to fetch sale details
      fetchSaleDetails: async (saleId: string) => {
        set({ isLoadingSaleDetails: true, saleDetailsError: null })

        try {
          const response = await fetch(`/api/sales/${saleId}/details`)
          if (!response.ok) throw new Error("Failed to fetch sale details")

          const data = await response.json()
          const details = Array.isArray(data) ? data : data.details || []

          set({ saleDetails: details, isLoadingSaleDetails: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            saleDetailsError: errorMessage,
            isLoadingSaleDetails: false,
          })
        }
      },
    }),
    { name: "sale-store" },
  ),
)
