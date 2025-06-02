import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Category, Product, Customer, Sale, Cart, Employee, Department, Auth } from "@/lib/generated/prisma";
import { Position } from "postcss";

// interface AppState {
//   // Data
//   categories: Category[];
//   employees: Employee[];
//   products: Product[];
//   customers: Customer[];
//   sales: Sale[];
//   carts: Cart[];

//   // Loading states
//   isLoadingCategories: boolean;
//   isLoadingProducts: boolean;
//   isLoadingCustomers: boolean;
//   isLoadingSales: boolean;
//   isLoadingCarts: boolean;
//   isLoadingEmployees: boolean;

//   isCreatingProduct: boolean;
//   isUpdatingProduct: boolean;
//   isDeletingProduct: boolean;
//   isCreatingCategory: boolean;
//   isCreatingCustomer: boolean;
//   isCreatingSale: boolean;
//   isCreatingCart: boolean;
//   isCreatingEmployee: boolean;
//   isUpdatingEmployee: boolean;
//   isDeletingEmployee: boolean;


//   // Error states
//   categoriesError: string | null;
//   productsError: string | null;
//   customersError: string | null;
//   salesError: string | null;
//   cartsError: string | null;
//   employeeError: string | null;

//   // Actions
//   fetchCategories: () => Promise<void>;
//   fetchProducts: () => Promise<void>;
//   fetchCustomers: () => Promise<void>;
//   fetchSales: () => Promise<void>;
//   fetchCarts: () => Promise<void>;
//   fetchEmployees: () => Promise<void>;

//   createProduct: (data: Partial<Product>, file?: File) => Promise<boolean>;
//   updateProduct: (id: string, data: Partial<Product>, file?: File) => Promise<boolean>;
//   deleteProduct: (id: string) => Promise<boolean>;

//   createCategory: (data: Partial<Category>, file?: File) => Promise<boolean>;
//   createCustomer: (data: Partial<Customer>) => Promise<boolean>;
//   createSale: (data: Partial<Sale>) => Promise<boolean>;
//   createCart: (data: Partial<Cart>) => Promise<boolean>;
//   createEmployee: (data: Partial<Employee>) => Promise<boolean>;

//   clearErrors: () => void;

//   // Computed
//   getActiveCategories: () => Category[];
//   getActiveProducts: () => Product[];
//   getActiveCustomers: () => Customer[];
//   getActiveSales: () => Sale[];
//   getActiveCarts: () => Cart[];
//   getActiveEmployees: () => Employee[];
// }

// Upload utility (unchanged from original)

interface AppState {
  // Data
  me: Auth[];
  categories: Category[];
  employees: Employee[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  carts: Cart[];
  departments: Department[];
  positions: Position[];


  // Loading states
  isLoadingMe: boolean;
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  isLoadingCustomers: boolean;
  isLoadingSales: boolean;
  isLoadingCarts: boolean;
  isLoadingEmployees: boolean;
  isLoadingDepartments: boolean;
  isLoadingPositions: boolean;

  isCreatingProduct: boolean;
  isCreatingCategory: boolean;
  isCreatingCustomer: boolean;
  isCreatingSale: boolean;
  isCreatingEmployee: boolean;
  isCreatingCart: boolean;
  isCreatingDepartment: boolean;
  isCreatingPosition: boolean;

  isUpdatingProduct: boolean;
  isUpdatingEmployee: boolean;
  isUpdatingPosition: boolean;
  isUpdatingDepartment: boolean;
  isUpdatingCategory: boolean;

  isDeletingCategory: boolean;
  isDeletingEmployee: boolean;
  isDeletingDepartment: boolean;
  isDeletingProduct: boolean;
  isDeletingPosition: boolean;

  // Error states
  meError: string | null;
  categoriesError: string | null;
  productsError: string | null;
  customersError: string | null;
  salesError: string | null;
  cartsError: string | null;
  employeeError: string | null;
  departmentError: string | null;
  positionError: string | null;

  // Actions
  fetchMe: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchSales: () => Promise<void>;
  fetchCarts: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchPositions: () => Promise<void>;

  createProduct: (data: Partial<Product>, file?: File) => Promise<boolean>;
  createCategory: (data: Partial<Category>, file?: File) => Promise<boolean>;
  createCustomer: (data: Partial<Customer>) => Promise<boolean>;
  createSale: (data: Partial<Sale>) => Promise<boolean>;
  createCart: (data: Partial<Cart>) => Promise<boolean>;
  createEmployee: (data: Partial<Employee>, file?: File) => Promise<boolean>;
  createDepartment: (data: Partial<Department>) => Promise<boolean>;
  createPosition: (data: Partial<Position>) => Promise<boolean>;

  updateProduct: (id: string, data: Partial<Product>, file?: File) => Promise<boolean>;
  updateEmployee: (id: string, data: Partial<Employee>, file?: File) => Promise<boolean>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<boolean>;
  updatePosition: (id: string, data: Partial<Position>) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<boolean>;

  deleteCategory: (id: string, data: Partial<Category>) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteDepartment: (id: string) => Promise<boolean>;
  deletePosition: (id: string) => Promise<boolean>;

  clearErrors: () => void;



  // Computed
  getActiveCategories: () => Category[];
  getActiveProducts: () => Product[];
  getActiveCustomers: () => Customer[];
  getActiveSales: () => Sale[];
  getActiveCarts: () => Cart[];
  getActiveEmployees: () => Employee[];
  getActiveDepartments: () => Department[];
  getActivePositions: () => Position[];
}

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
      me: [],
      categories: [],
      products: [],
      customers: [],
      sales: [],
      carts: [],
      employees: [],
      departments: [],
      positions: [],

      isLoadingMe: false,
      isLoadingEmployees: false,
      isCreatingEmployee: false,
      isUpdatingEmployee: false,
      isDeletingEmployee: false,
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
      isUpdatingCategory: false,
      isDeletingCategory: false,

      meError: null,
      employeeError: null,
      categoriesError: null,
      productsError: null,
      customersError: null,
      salesError: null,
      departmentError: null,
      positionError: null,
      cartsError: null,

      isLoadingDepartments: false,
      isLoadingPositions: false,
      isCreatingDepartment: false,
      isUpdatingDepartment: false,
      isDeletingDepartment: false,
      isCreatingPosition: false,
      isUpdatingPosition: false,
      isDeletingPosition: false,

      fetchMe: async () => {
        const { isLoadingMe } = get()
        if (isLoadingMe) return;

        set({ isLoadingMe: true, meError: null })

        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) throw new Error("Failed to get auth.")

          const data = await response.json()
          const me = Array.isArray(data) ? data : data.me || [];

          set({ me, isLoadingMe: false })
        } catch (error: unknown) {
          throw new Error("Failed")
        }
      },

      fetchDepartments: async () => {
        const { isLoadingDepartments } = get();
        if (isLoadingDepartments) return;

        set({ isLoadingDepartments: true, departmentError: null });

        try {
          const response = await fetch("/api/departments");
          if (!response.ok) throw new Error("Failed to fetch departments");

          const data = await response.json();
          const departments = Array.isArray(data) ? data : data.departments || [];

          set({ departments, isLoadingDepartments: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            departmentError: errorMessage,
            isLoadingDepartments: false,
          });
        }
      },

      createDepartment: async (departmentData: Partial<Department>) => {
        set({ isCreatingDepartment: true, departmentError: null });

        try {
          // Validate required fields
          if (!departmentData.departmentName) {
            throw new Error("Department name is required");
          }

          const response = await fetch("/api/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create department");
          }

          const newDepartment = await response.json();

          set((state) => ({
            departments: [newDepartment, ...state.departments],
            isCreatingDepartment: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            departmentError: errorMessage,
            isCreatingDepartment: false,
          });
          return false;
        }
      },

      updateDepartment: async (id: string, departmentData: Partial<Department>) => {
        set({ isUpdatingDepartment: true, departmentError: null });

        try {
          const response = await fetch(`/api/departments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update department");
          }

          const updatedDepartment = await response.json();

          set((state) => ({
            departments: state.departments.map((d) =>
              d.departmentId === id ? updatedDepartment : d
            ),
            isUpdatingDepartment: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            departmentError: errorMessage,
            isUpdatingDepartment: false,
          });
          return false;
        }
      },

      deleteDepartment: async (id: string) => {
        set({ isDeletingDepartment: true, departmentError: null });

        try {
          const response = await fetch(`/api/departments/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete department");
          }

          set((state) => ({
            departments: state.departments.filter((d) => d.departmentId !== id),
            isDeletingDepartment: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            departmentError: errorMessage,
            isDeletingDepartment: false,
          });
          return false;
        }
      },

      fetchPositions: async () => {
        const { isLoadingPositions } = get();
        if (isLoadingPositions) return;

        set({ isLoadingPositions: true, positionError: null });

        try {
          const response = await fetch("/api/positions");
          if (!response.ok) throw new Error("Failed to fetch positions");

          const data = await response.json();
          const positions = Array.isArray(data) ? data : data.positions || [];

          set({ positions, isLoadingPositions: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            positionError: errorMessage,
            isLoadingPositions: false,
          });
        }
      },

      createPosition: async (positionData: Partial<Position>) => {
        set({ isCreatingPosition: true, positionError: null });

        try {
          if (!positionData.positionName || !positionData.departmentId) {
            throw new Error("Position name and department ID are required");
          }

          const response = await fetch("/api/positions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(positionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create position");
          }

          const newPosition = await response.json();

          set((state) => ({
            positions: [newPosition, ...state.positions],
            isCreatingPosition: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            positionError: errorMessage,
            isCreatingPosition: false,
          });
          return false;
        }
      },

      updatePosition: async (id: string, positionData: Partial<Position>) => {
        set({ isUpdatingPosition: true, positionError: null });

        try {
          const response = await fetch(`/api/positions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(positionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update position");
          }

          const updatedPosition = await response.json();

          set((state) => ({
            positions: state.positions.map((p) =>
              p.positionId === id ? updatedPosition : p
            ),
            isUpdatingPosition: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            positionError: errorMessage,
            isUpdatingPosition: false,
          });
          return false;
        }
      },

      deletePosition: async (id: string) => {
        set({ isDeletingPosition: true, positionError: null });

        try {
          const response = await fetch(`/api/positions/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete position");
          }

          set((state) => ({
            positions: state.positions.filter((p) => p.positionId !== id),
            isDeletingPosition: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            positionError: errorMessage,
            isDeletingPosition: false,
          });
          return false;
        }
      },

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

      deleteCategory: async (id: string) => {
        set({ isDeletingPosition: true, positionError: null });

        try {
          const response = await fetch(`/api/positions/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete position");
          }

          set((state) => ({
            positions: state.positions.filter((p) => p.positionId !== id),
            isDeletingPosition: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            positionError: errorMessage,
            isDeletingPosition: false,
          });
          return false;
        }
      },

      updateCategory: async (id, productData) => {
        set({ isUpdatingProduct: true, productsError: null });

        try {
          const response = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...productData,

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
      createEmployee: async (employeeData: Partial<Employee>, file?: File) => {
        set({ isCreatingEmployee: true, employeeError: null }); // Fixed typo

        try {
          let pictureUrl = "";
          if (file) {
            pictureUrl = await uploadFile(file);
          }

          const response = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...employeeData,
              picture: pictureUrl || employeeData.picture,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create employee");
          }

          const newEmployee = await response.json();

          set((state) => ({
            employees: [newEmployee, ...state.employees],
            isCreatingEmployee: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            employeeError: errorMessage,
            isCreatingEmployee: false,
          });
          return false;
        }
      },
      updateEmployee: async (id: string, employeeData: Partial<Employee>, file?: File) => {
        set({ isUpdatingEmployee: true, employeeError: null });

        try {
          let pictureUrl = employeeData.picture;
          if (file) {
            pictureUrl = await uploadFile(file);
          }

          const response = await fetch(`/api/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...employeeData,
              picture: pictureUrl,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update employee");
          }

          const updatedEmployee = await response.json();

          set((state) => ({
            employees: state.employees.map((e) =>
              e.employeeId === id ? updatedEmployee : e
            ),
            isUpdatingEmployee: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            employeeError: errorMessage,
            isUpdatingEmployee: false,
          });
          return false;
        }
      },

      deleteEmployee: async (id: string) => {
        set({ isDeletingEmployee: true, employeeError: null });

        try {
          const response = await fetch(`/api/employees/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete employee");
          }

          set((state) => ({
            employees: state.employees.filter((e) => e.employeeId !== id),
            isDeletingEmployee: false,
          }));

          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            employeeError: errorMessage,
            isDeletingEmployee: false,
          });
          return false;
        }
      },

      fetchEmployees: async () => {
        const { isLoadingEmployees } = get();
        if (isLoadingEmployees) return;

        set({ isLoadingEmployees: true, employeeError: null });

        try {
          const response = await fetch("/api/employees");
          if (!response.ok) throw new Error("Failed to fetch employees");

          const data = await response.json();
          const employees = Array.isArray(data) ? data : data.employees || [];

          set({ employees, isLoadingEmployees: false }); // Fixed: Set employees, not employeeError
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({
            employeeError: errorMessage, // Fixed: Use employeeError
            isLoadingEmployees: false,
          });
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
          employeeError: null,
          departmentError: null,
          positionError: null,
          meError: null
        });
      },

      // Computed values
      getActiveEmployees: () => {
        return get().employees.filter((emp) => emp.status === "active"); // Fixed typo
      },
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
      getActiveDepartments: () => {
        return get().departments.filter((dept) => dept?.status === "active") ?? [];
      },

      getActivePositions: () => {
        return get().positions.filter((pos) => pos?.status === "active") ?? [];
      },
    }),
    {
      name: "app-store",
    }
  )
);
