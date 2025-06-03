import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Stock, Stockentry } from "@/lib/generated/prisma"


export interface CreateStockData {
  productId: string
  memo?: string
  quantity: number
}

export interface CreateStockEntryData {
  quantity: number
  memo?: string
  entryPrice: number
  entryDate?: Date
  productId: string
  supplierId: string
  invoice?: string
}

export type StockStore = BaseStore<Stock, CreateStockData> & {
  stockEntries: Stockentry[]
  isLoadingStockEntries: boolean
  isCreatingStockEntry: boolean
  stockEntriesError: string | null
  fetchStockEntries: (productId: string) => Promise<void>
  createStockEntry: (data: CreateStockEntryData) => Promise<boolean>
}

export const useStockStore = create<StockStore>()(
  devtools(
    (set, get) => ({
      ...createBaseStore<Stock, CreateStockData>({
        endpoint: "/api/stocks",
        entityName: "stocks",
        idField: "stockId",
      })(set, get),

      // Additional state for stock entries
      stockEntries: [],
      isLoadingStockEntries: false,
      isCreatingStockEntry: false,
      stockEntriesError: null,

      // Custom method to fetch stock entries
      fetchStockEntries: async (productId: string) => {
        set({ isLoadingStockEntries: true, stockEntriesError: null })

        try {
          const response = await fetch(`/api/products/${productId}/stock-entries`)
          if (!response.ok) throw new Error("Failed to fetch stock entries")

          const data = await response.json()
          const entries = Array.isArray(data) ? data : data.entries || []

          set({ stockEntries: entries, isLoadingStockEntries: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            stockEntriesError: errorMessage,
            isLoadingStockEntries: false,
          })
        }
      },

      // Custom method to create stock entry
      createStockEntry: async (entryData: CreateStockEntryData) => {
        set({ isCreatingStockEntry: true, stockEntriesError: null })

        try {
          const response = await fetch("/api/stock-entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entryData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create stock entry")
          }

          const newEntry = await response.json()

          set((state) => ({
            stockEntries: [newEntry, ...state.stockEntries],
            isCreatingStockEntry: false,
          }))

          // Update the stock quantity if this entry is for a product we already have in stock
          const { items } = get()
          const stockItem = items.find((item) => item.productId === entryData.productId)

          if (stockItem) {
            const updatedStock = {
              ...stockItem,
              quantity: stockItem.quantity + entryData.quantity,
            }

            set((state) => ({
              items: state.items.map((item) => (item.productId === entryData.productId ? updatedStock : item)),
            }))
          }

          return true
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
          set({
            stockEntriesError: errorMessage,
            isCreatingStockEntry: false,
          })
          return false
        }
      },
    }),
    { name: "stock-store" },
  ),
)
