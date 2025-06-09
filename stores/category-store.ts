// stores/category-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Category } from "@/lib/generated/prisma";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";

export interface CreateCategoryData {
  categoryName: string;
  categoryCode?: string;
  picture?: string;
  memo?: string;
}

interface CategoryStore {
  items: Category[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: CreateCategoryData) => Promise<boolean>;
  update: (id: string, data: CreateCategoryData) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,

      fetch: async () => {
        set({ isLoading: true, error: null });
        const result = await fetchCategories();
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      create: async (data: CreateCategoryData) => {
        set({ isLoading: true, error: null });
        const result = await createCategory(data);
        if (result.success) {
          set((state) => ({
            items: [...state.items, result.data],
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },

      update: async (id: string, data: CreateCategoryData) => {
        set({ isLoading: true, error: null });
        const result = await updateCategory(id, data);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) =>
              item.categoryId === id ? result.data : item
            ),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },

      delete: async (id: string) => {
        set({ isLoading: true, error: null });
        const result = await deleteCategory(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.categoryId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "category-store" }
  )
);

// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Category } from "@/lib/generated/prisma"



// export interface CreateCategoryData {
//   categoryName: string
//   categoryCode?: string
//   picture?: string
//   memo?: string
// }

// export type CategoryStore = BaseStore<Category, CreateCategoryData>

// export const useCategoryStore = create<CategoryStore>()(
//   devtools(
//     createBaseStore<Category, CreateCategoryData>({
//       endpoint: "/api/categories",
//       entityName: "categories",
//       idField: "categoryId",
//     }),
//     { name: "category-store" },
//   ),
// )
