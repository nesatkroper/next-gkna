import { create } from "zustand"

interface Payment {
  paymentId: string
  employeeId: string
  saleId: string
  invoice?: string | null
  hash?: string | null
  fromAccountId: string
  toAccountId: string
  currency: string
  amount: number
  externalRef: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  Employee?: { employeeId: string; firstName: string; lastName: string } | null
  Sale?: { saleId: string; saleDate: string } | null
}

interface PaymentStore {
  items: Payment[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Payment>) => Promise<boolean>
  update: (id: string, data: Partial<Payment>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/payments")
      if (!response.ok) throw new Error("Failed to fetch payments")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.payments || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch payments", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create payment")
      }
      const newPayment = await response.json()
      set((state) => ({ items: [...state.items, newPayment] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payment")
      }
      const updatedPayment = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.paymentId === id ? updatedPayment : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete payment")
      set((state) => ({
        items: state.items.filter((item) => item.paymentId !== id),
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
// import { Payment } from "@/lib/generated/prisma"



// export interface CreatePaymentData {
//   employeeId: string
//   saleId: string
//   invoice?: string
//   fromAccountId: string
//   toAccountId: string
//   currency: string
//   amount: number
//   externalRef: string
// }

// export type PaymentStore = BaseStore<Payment, CreatePaymentData>

// export const usePaymentStore = create<PaymentStore>()(
//   devtools(
//     createBaseStore<Payment, CreatePaymentData>({
//       endpoint: "/api/payments",
//       entityName: "payments",
//       idField: "paymentId",
//     }),
//     { name: "payment-store" },
//   ),
// )
