import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Supplier {
  supplierId: string
  supplierName: string
  companyName?: string
  phone?: string
  email?: string
  address?: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CreateSupplierData {
  supplierName: string
  companyName?: string
  phone?: string
  email?: string
  address?: string
}

export type SupplierStore = BaseStore<Supplier, CreateSupplierData>

export const useSupplierStore = create<SupplierStore>()(
  devtools(
    createBaseStore<Supplier, CreateSupplierData>({
      endpoint: "/api/suppliers",
      entityName: "suppliers",
      idField: "supplierId",
    }),
    { name: "supplier-store" },
  ),
)
