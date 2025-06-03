import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Product } from "@/lib/generated/prisma"


export interface CreateProductData {
  productName: string
  productCode?: string
  categoryId: string
  picture?: string
  unit?: string
  capacity?: string
  sellPrice: number
  costPrice: number
  discountRate?: number
  desc?: string
}

export type ProductStore = BaseStore<Product, CreateProductData>

export const useProductStore = create<ProductStore>()(
  devtools(
    createBaseStore<Product, CreateProductData>({
      endpoint: "/api/products",
      entityName: "products",
      idField: "productId",
    }),
    { name: "product-store" },
  ),
)
