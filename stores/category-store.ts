import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Category } from "@/lib/generated/prisma"



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
