import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Payment } from "@/lib/generated/prisma"



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
