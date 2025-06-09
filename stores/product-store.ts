// // stores/product-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchProducts, createProduct, updateProduct, deleteProduct, CreateProductData } from "@/actions/products";

interface Product {
  productId: string;
  productName: string;
  productCode?: string | null;
  picture?: string | null;
  unit?: string | null;
  capacity?: number | null;
  sellPrice: number;
  costPrice: number;
  discountRate: number;
  desc?: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  brandId?: string | null;
  Category?: { categoryName: string };
  Brand?: { brandName: string };
  Stock?: { quantity: number }[];
}

interface ProductStore {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: Partial<Product>, file?: File | null) => Promise<boolean>;
  update: (id: string, data: Partial<Product>, file?: File | null) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
}

export const useProductStore = create<ProductStore>()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      fetch: async () => {
        set({ isLoading: true, error: null });
        const result = await fetchProducts();
        if (result.success) {
          set({ items: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },
      create: async (data: Partial<Product>, file?: File | null) => {
        set({ isLoading: true, error: null });
        const result = await createProduct(data as CreateProductData, file);
        if (result.success) {
          set((state) => ({ items: [...state.items, result.data], isLoading: false }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      update: async (id: string, data: Partial<Product>, file?: File | null) => {
        set({ isLoading: true, error: null });
        const result = await updateProduct(id, data as CreateProductData, file);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) => (item.productId === id ? result.data : item)),
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
        const result = await deleteProduct(id);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== id),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "productStore" }
  )
);


// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Product } from "@/lib/generated/prisma"


// export interface CreateProductData {
//   productName: string
//   productCode?: string
//   categoryId: string
//   picture?: string
//   unit?: string
//   capacity?: string
//   sellPrice: number
//   costPrice: number
//   discountRate?: number
//   desc?: string
// }

// export type ProductStore = BaseStore<Product, CreateProductData>

// export const useProductStore = create<ProductStore>()(
//   devtools(
//     createBaseStore<Product, CreateProductData>({
//       endpoint: "/api/products",
//       entityName: "products",
//       idField: "productId",
//     }),
//     { name: "product-store" },
//   ),
// )
