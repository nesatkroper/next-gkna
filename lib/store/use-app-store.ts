import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Category, Product, Customer, Sale, Cart } from "@/lib/generated/prisma";

interface AppState {
  // Data
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  carts: Cart[];

  // Loading states
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  isLoadingCustomers: boolean;
  isLoadingSales: boolean;
  isLoadingCarts: boolean;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isCreatingCategory: boolean;
  isCreatingCustomer: boolean;
  isCreatingSale: boolean;
  isCreatingCart: boolean;

  // Error states
  categoriesError: string | null;
  productsError: string | null;
  customersError: string | null;
  salesError: string | null;
  cartsError: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchSales: () => Promise<void>;
  fetchCarts: () => Promise<void>;
  createProduct: (data: Partial<Product>, file?: File) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>, file?: File) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  createCategory: (data: Partial<Category>, file?: File) => Promise<boolean>;
  createCustomer: (data: Partial<Customer>) => Promise<boolean>;
  createSale: (data: Partial<Sale>) => Promise<boolean>;
  createCart: (data: Partial<Cart>) => Promise<boolean>;
  clearErrors: () => void;

  // Computed
  getActiveCategories: () => Category[];
  getActiveProducts: () => Product[];
  getActiveCustomers: () => Customer[];
  getActiveSales: () => Sale[];
  getActiveCarts: () => Cart[];
}

// Upload utility (unchanged from original)
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const data = await response.json();
  return data.url;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      products: [],
      customers: [],
      sales: [],
      carts: [],
      isLoadingCategories: false,
      isLoadingProducts: false,
      isLoadingCustomers: false,
      isLoadingSales: false,
      isLoadingCarts: false,
      isCreatingProduct: false,
      isUpdatingProduct: false,
      isDeletingProduct: false,
      isCreatingCategory: false,
      isCreatingCustomer: false,
      isCreatingSale: false,
      isCreatingCart: false,
      categoriesError: null,
      productsError: null,
      customersError: null,
      salesError: null,
      cartsError: null,

      // Actions (existing)
      fetchCategories: async () => {
        const { isLoadingCategories } = get();
        if (isLoadingCategories) return;

        set({ isLoadingCategories: true, categoriesError: null });

        try {
          const response = await fetch("/api/categories");
          if (!response.ok) throw new Error("Failed to fetch categories");

          const data = await response.json();
          const categories = Array.isArray(data) ? data : data.categories || [];

          set({ categories, isLoadingCategories: false });
        } catch (error) {
          set({
            categoriesError: error.message,
            isLoadingCategories: false,
          });
        }
      },

      fetchProducts: async () => {
        const { isLoadingProducts } = get();
        if (isLoadingProducts) return;

        set({ isLoadingProducts: true, productsError: null });

        try {
          const response = await fetch("/api/products");
          if (!response.ok) throw new Error("Failed to fetch products");

          const data = await response.json();
          const products = Array.isArray(data) ? data : data.products || [];

          set({ products, isLoadingProducts: false });
        } catch (error) {
          set({
            productsError: error.message,
            isLoadingProducts: false,
          });
        }
      },

      createProduct: async (productData, file) => {
        set({ isCreatingProduct: true, productsError: null });

        try {
          let pictureUrl = "";
          if (file) {
            pictureUrl = await uploadFile(file);
          }

          const response = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...productData,
              picture: pictureUrl || productData.picture,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create product");
          }

          const newProduct = await response.json();

          set((state) => ({
            products: [newProduct, ...state.products],
            isCreatingProduct: false,
          }));

          return true;
        } catch (error) {
          set({
            productsError: error.message,
            isCreatingProduct: false,
          });
          return false;
        }
      },

      updateProduct: async (id, productData, file) => {
        set({ isUpdatingProduct: true, productsError: null });

        try {
          let pictureUrl = productData.picture;
          if (file) {
            pictureUrl = await uploadFile(file);
          }

          const response = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...productData,
              picture: pictureUrl,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update product");
          }

          const updatedProduct = await response.json();

          set((state) => ({
            products: state.products.map((p) =>
              p.productId === id ? updatedProduct : p
            ),
            isUpdatingProduct: false,
          }));

          return true;
        } catch (error) {
          set({
            productsError: error.message,
            isUpdatingProduct: false,
          });
          return false;
        }
      },

      deleteProduct: async (id) => {
        set({ isDeletingProduct: true, productsError: null });

        try {
          const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete product");
          }

          set((state) => ({
            products: state.products.filter((p) => p.productId !== id),
            isDeletingProduct: false,
          }));

          return true;
        } catch (error) {
          set({
            productsError: error.message,
            isDeletingProduct: false,
          });
          return false;
        }
      },

      createCategory: async (categoryData, file) => {
        set({ isCreatingCategory: true, categoriesError: null });

        try {
          let pictureUrl = "";
          if (file) {
            pictureUrl = await uploadFile(file);
          }

          const response = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...categoryData,
              picture: pictureUrl || categoryData.picture,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create category");
          }

          const newCategory = await response.json();

          set((state) => ({
            categories: [newCategory, ...state.categories],
            isCreatingCategory: false,
          }));

          return true;
        } catch (error) {
          set({
            categoriesError: error.message,
            isCreatingCategory: false,
          });
          return false;
        }
      },

      // New actions for Customer
      fetchCustomers: async () => {
        const { isLoadingCustomers } = get();
        if (isLoadingCustomers) return;

        set({ isLoadingCustomers: true, customersError: null });

        try {
          const response = await fetch("/api/customers");
          if (!response.ok) throw new Error("Failed to fetch customers");

          const data = await response.json();
          const customers = Array.isArray(data) ? data : data.customers || [];

          set({ customers, isLoadingCustomers: false });
        } catch (error) {
          set({
            customersError: error.message,
            isLoadingCustomers: false,
          });
        }
      },

      createCustomer: async (customerData) => {
        set({ isCreatingCustomer: true, customersError: null });

        try {
          const response = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create customer");
          }

          const newCustomer = await response.json();

          set((state) => ({
            customers: [newCustomer, ...state.customers],
            isCreatingCustomer: false,
          }));

          return true;
        } catch (error) {
          set({
            customersError: error.message,
            isCreatingCustomer: false,
          });
          return false;
        }
      },

      // New actions for Sale
      fetchSales: async () => {
        const { isLoadingSales } = get();
        if (isLoadingSales) return;

        set({ isLoadingSales: true, salesError: null });

        try {
          const response = await fetch("/api/sales");
          if (!response.ok) throw new Error("Failed to fetch sales");

          const data = await response.json();
          const sales = Array.isArray(data) ? data : data.sales || [];

          set({ sales, isLoadingSales: false });
        } catch (error) {
          set({
            salesError: error.message,
            isLoadingSales: false,
          });
        }
      },

      createSale: async (saleData) => {
        set({ isCreatingSale: true, salesError: null });

        try {
          const response = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saleData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create sale");
          }

          const newSale = await response.json();

          set((state) => ({
            sales: [newSale, ...state.sales],
            isCreatingSale: false,
          }));

          return true;
        } catch (error) {
          set({
            salesError: error.message,
            isCreatingSale: false,
          });
          return false;
        }
      },

      // New actions for Cart
      fetchCarts: async () => {
        const { isLoadingCarts } = get();
        if (isLoadingCarts) return;

        set({ isLoadingCarts: true, cartsError: null });

        try {
          const response = await fetch("/api/carts");
          if (!response.ok) throw new Error("Failed to fetch carts");

          const data = await response.json();
          const carts = Array.isArray(data) ? data : data.carts || [];

          set({ carts, isLoadingCarts: false });
        } catch (error) {
          set({
            cartsError: error.message,
            isLoadingCarts: false,
          });
        }
      },

      createCart: async (cartData) => {
        set({ isCreatingCart: true, cartsError: null });

        try {
          const response = await fetch("/api/carts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cartData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create cart");
          }

          const newCart = await response.json();

          set((state) => ({
            carts: [newCart, ...state.carts],
            isCreatingCart: false,
          }));

          return true;
        } catch (error) {
          set({
            cartsError: error.message,
            isCreatingCart: false,
          });
          return false;
        }
      },

      clearErrors: () => {
        set({
          categoriesError: null,
          productsError: null,
          customersError: null,
          salesError: null,
          cartsError: null,
        });
      },

      // Computed values
      getActiveCategories: () => {
        return get().categories.filter((cat) => cat.status === "active");
      },

      getActiveProducts: () => {
        return get().products.filter((prod) => prod.status === "active");
      },

      getActiveCustomers: () => {
        return get().customers.filter((cust) => cust.status === "active");
      },

      getActiveSales: () => {
        return get().sales.filter((sale) => sale.status === "active");
      },

      getActiveCarts: () => {
        return get().carts.filter((cart) => cart.status === "active");
      },
    }),
    {
      name: "app-store",
    }
  )
);



// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { Category, Product } from "@/lib/generated/prisma"

// interface AppState {
//   // Data
//   categories: Category[]
//   products: Product[]

//   // Loading states
//   isLoadingCategories: boolean
//   isLoadingProducts: boolean
//   isCreatingProduct: boolean
//   isUpdatingProduct: boolean
//   isDeletingProduct: boolean
//   isCreatingCategory: boolean

//   // Error states
//   categoriesError: string | null
//   productsError: string | null

//   // Actions
//   fetchCategories: () => Promise<void>
//   fetchProducts: () => Promise<void>
//   createProduct: (data: Partial<Product>, file?: File) => Promise<boolean>
//   updateProduct: (id: string, data: Partial<Product>, file?: File) => Promise<boolean>
//   deleteProduct: (id: string) => Promise<boolean>
//   createCategory: (data: Partial<Category>, file?: File) => Promise<boolean>
//   clearErrors: () => void

//   // Computed
//   getActiveCategories: () => Category[]
//   getActiveProducts: () => Product[]
// }

// // Upload utility
// const uploadFile = async (file: File): Promise<string> => {
//   const formData = new FormData()
//   formData.append("file", file)

//   const response = await fetch("/api/upload", {
//     method: "POST",
//     body: formData,
//   })

//   if (!response.ok) {
//     throw new Error("Failed to upload file")
//   }

//   const data = await response.json()
//   return data.url
// }

// export const useAppStore = create<AppState>()(
//   devtools(
//     (set, get) => ({
//       // Initial state
//       categories: [],
//       products: [],
//       isLoadingCategories: false,
//       isLoadingProducts: false,
//       isCreatingProduct: false,
//       isUpdatingProduct: false,
//       isDeletingProduct: false,
//       isCreatingCategory: false,
//       categoriesError: null,
//       productsError: null,

//       // Actions
//       fetchCategories: async () => {
//         const { isLoadingCategories } = get()
//         if (isLoadingCategories) return

//         set({ isLoadingCategories: true, categoriesError: null })

//         try {
//           const response = await fetch("/api/categories")
//           if (!response.ok) throw new Error("Failed to fetch categories")

//           const data = await response.json()
//           const categories = Array.isArray(data) ? data : data.categories || []

//           set({ categories, isLoadingCategories: false })
//         } catch (error) {
//           set({
//             categoriesError: error.message,
//             isLoadingCategories: false,
//           })
//         }
//       },

//       fetchProducts: async () => {
//         const { isLoadingProducts } = get()
//         if (isLoadingProducts) return

//         set({ isLoadingProducts: true, productsError: null })

//         try {
//           const response = await fetch("/api/products")
//           if (!response.ok) throw new Error("Failed to fetch products")

//           const data = await response.json()
//           const products = Array.isArray(data) ? data : data.products || []

//           set({ products, isLoadingProducts: false })
//         } catch (error) {
//           set({
//             productsError: error.message,
//             isLoadingProducts: false,
//           })
//         }
//       },

//       createProduct: async (productData, file) => {
//         set({ isCreatingProduct: true, productsError: null })

//         try {
//           let pictureUrl = ""
//           if (file) {
//             pictureUrl = await uploadFile(file)
//           }

//           const response = await fetch("/api/products", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               ...productData,
//               picture: pictureUrl || productData.picture,
//             }),
//           })

//           if (!response.ok) {
//             const errorData = await response.json()
//             throw new Error(errorData.error || "Failed to create product")
//           }

//           const newProduct = await response.json()

//           set((state) => ({
//             products: [newProduct, ...state.products],
//             isCreatingProduct: false,
//           }))

//           return true
//         } catch (error) {
//           set({
//             productsError: error.message,
//             isCreatingProduct: false,
//           })
//           return false
//         }
//       },

//       updateProduct: async (id, productData, file) => {
//         set({ isUpdatingProduct: true, productsError: null })

//         try {
//           let pictureUrl = productData.picture
//           if (file) {
//             pictureUrl = await uploadFile(file)
//           }

//           const response = await fetch(`/api/products/${id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               ...productData,
//               picture: pictureUrl,
//             }),
//           })

//           if (!response.ok) {
//             const errorData = await response.json()
//             throw new Error(errorData.error || "Failed to update product")
//           }

//           const updatedProduct = await response.json()

//           set((state) => ({
//             products: state.products.map((p) => (p.productId === id ? updatedProduct : p)),
//             isUpdatingProduct: false,
//           }))

//           return true
//         } catch (error) {
//           set({
//             productsError: error.message,
//             isUpdatingProduct: false,
//           })
//           return false
//         }
//       },

//       deleteProduct: async (id) => {
//         set({ isDeletingProduct: true, productsError: null })

//         try {
//           const response = await fetch(`/api/products/${id}`, {
//             method: "DELETE",
//           })

//           if (!response.ok) {
//             const errorData = await response.json()
//             throw new Error(errorData.error || "Failed to delete product")
//           }

//           set((state) => ({
//             products: state.products.filter((p) => p.productId !== id),
//             isDeletingProduct: false,
//           }))

//           return true
//         } catch (error) {
//           set({
//             productsError: error.message,
//             isDeletingProduct: false,
//           })
//           return false
//         }
//       },

//       createCategory: async (categoryData, file) => {
//         set({ isCreatingCategory: true, categoriesError: null })

//         try {
//           let pictureUrl = ""
//           if (file) {
//             pictureUrl = await uploadFile(file)
//           }

//           const response = await fetch("/api/categories", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               ...categoryData,
//               picture: pictureUrl || categoryData.picture,
//             }),
//           })

//           if (!response.ok) {
//             const errorData = await response.json()
//             throw new Error(errorData.error || "Failed to create category")
//           }

//           const newCategory = await response.json()

//           set((state) => ({
//             categories: [newCategory, ...state.categories],
//             isCreatingCategory: false,
//           }))

//           return true
//         } catch (error) {
//           set({
//             categoriesError: error.message,
//             isCreatingCategory: false,
//           })
//           return false
//         }
//       },

//       clearErrors: () => {
//         set({ categoriesError: null, productsError: null })
//       },

//       // Computed values
//       getActiveCategories: () => {
//         return get().categories.filter((cat) => cat.status === "active")
//       },

//       getActiveProducts: () => {
//         return get().products.filter((prod) => prod.status === "active")
//       },
//     }),
//     {
//       name: "app-store",
//     },
//   ),
// )

