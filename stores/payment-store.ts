import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Payment {
  paymentId: string
  employeeId: string
  saleId: string
  invoice?: string
  hash: string
  fromAccountId: string
  toAccountId: string
  currency: string
  amount: number
  externalRef: string
  status: "active" | "inactive" | "pending"
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentData {
  employeeId: string
  saleId: string
  invoice?: string
  fromAccountId: string
  toAccountId: string
  currency: string
  amount: number
  externalRef: string
}

export type PaymentStore = BaseStore<Payment, CreatePaymentData>

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    createBaseStore<Payment, CreatePaymentData>({
      endpoint: "/api/payments",
      entityName: "payments",
      idField: "paymentId",
    }),
    { name: "payment-store" },
  ),
)
