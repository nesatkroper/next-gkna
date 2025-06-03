import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Customer } from "@/lib/generated/prisma"

export interface CreateCustomerData {
  firstName: string
  lastName: string
  gender?: "male" | "female" | "others"
  phone?: string
  employeeId?: string
  // CustomerInfo fields
  picture?: string
  region?: string
  email?: string
  note?: string
  govId?: string
  govPicture?: string
  govExpire?: Date
}

export type CustomerStore = BaseStore<Customer, CreateCustomerData>

export const useCustomerStore = create<CustomerStore>()(
  devtools(
    createBaseStore<Customer, CreateCustomerData>({
      endpoint: "/api/customers",
      entityName: "customers",
      idField: "customerId",
      imageFields: ["picture", "govPicture"],
    }),
    { name: "customer-store" },
  ),
)
