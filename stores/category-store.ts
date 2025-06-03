import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Category {
  categoryId: string
  picture?: string
  categoryName: string
  categoryCode?: string
  memo?: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryData {
  categoryName: string
  categoryCode?: string
  picture?: string
  memo?: string
}

export type CategoryStore = BaseStore<Category, CreateCategoryData>

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    createBaseStore<Category, CreateCategoryData>({
      endpoint: "/api/categories",
      entityName: "categories",
      idField: "categoryId",
    }),
    { name: "category-store" },
  ),
)
