

import { EntityBase, EntityIdFields, EntityMap, EntityName } from "@/types/store";
import { Auth, Cart, Category, Customer, Department, Employee, Product, Sale,Position } from "./generated/prisma";

const entityIdFields: EntityIdFields = {
  categories: 'categoryId',
  products: 'productId',
  customers: 'customerId',
  sales: 'saleId',
  carts: 'cartId',
  employees: 'employeeId',
  departments: 'departmentId',
  positions: 'positionId',
  auth: 'authId'
};

interface EntityState<T extends EntityBase> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface EntityActions<T extends EntityBase> {
  fetch: (query?: Record<string, any>) => Promise<void>;
  create: (data: Omit<T, 'createdAt' | 'updatedAt'>, file?: File) => Promise<T | null>;
  update: (id: string, data: Partial<T>, file?: File) => Promise<boolean>;
  delete: (id: string, softDelete?: boolean) => Promise<boolean>;
  getActive: () => T[];
  getById: (id: string) => T | undefined;
}

const createEntitySlice = <T extends EntityBase>(
  entityName: EntityName,
  set: (fn: (state: AppState) => Partial<AppState>) => void,
  get: () => AppState
): EntityState<T> & EntityActions<T> => {
  const idField = entityIdFields[entityName];

  return {
    data: [] as T[],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },

    fetch: async (query: Record<string, any> = {}) => {
      set((state) => ({ 
        entities: {
          ...state.entities,
          [entityName]: { ...state.entities[entityName], loading: true, error: null }
        }
      }));
      
      try {
        const queryString = new URLSearchParams(query).toString();
        const res = await fetch(`/api/${entityName}?${queryString}`);
        if (!res.ok) throw new Error(`Failed to fetch ${entityName}`);
        
        const { data, total } = await res.json();
        set((state) => ({
          entities: {
            ...state.entities,
            [entityName]: {
              ...state.entities[entityName],
              data,
              loading: false,
              pagination: { ...state.entities[entityName].pagination, total }
            }
          }
        }));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set((state) => ({
          entities: {
            ...state.entities,
            [entityName]: {
              ...state.entities[entityName],
              error: errorMessage,
              loading: false
            }
          }
        }));
      }
    },

    create: async (data: Partial<T>, file?: File) => {
      set((state) => ({
        entities: {
          ...state.entities,
          [entityName]: { ...state.entities[entityName], loading: true, error: null }
        }
      }));
      
      try {
        let body = data;
        if (file) {
          const pictureUrl = await uploadFile(file);
          body = { ...data, picture: pictureUrl };
        }

        const res = await fetch(`/api/${entityName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        
        if (!res.ok) throw new Error(`Failed to create ${entityName}`);
        
        const newItem = await res.json();
        set((state) => ({
          entities: {
            ...state.entities,
            [entityName]: {
              ...state.entities[entityName],
              data: [newItem, ...state.entities[entityName].data],
              loading: false
            }
          }
        }));
        return newItem;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set((state) => ({
          entities: {
            ...state.entities,
            [entityName]: {
              ...state.entities[entityName],
              error: errorMessage,
              loading: false
            }
          }
        }));
        return null;
      }
    },

    // ... other methods with similar type-safe implementations
  };
};



// // lib/store.ts
// import { EntityBase, EntityIdFields, EntityMap, EntityName } from "@/types/store";
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { Auth, Cart, Category, Customer, Department, Employee, Product, Sale,Position } from "./generated/prisma";


// const entityIdFields: EntityIdFields = {
//   categories: 'categoryId',
//   products: 'productId',
//   customers: 'customerId',
//   sales: 'saleId',
//   carts: 'cartId',
//   employees: 'employeeId',
//   departments: 'departmentId',
//   positions: 'positionId',
//   auth: 'authId'
// };

// interface EntityState<T extends EntityBase> {
//   data: T[];
//   loading: boolean;
//   error: string | null;
//   pagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//   };
// }

// interface EntityActions<T extends EntityBase> {
//   fetch: (query?: Record<string, any>) => Promise<void>;
//   create: (data: Omit<T, 'createdAt' | 'updatedAt'>, file?: File) => Promise<T | null>;
//   update: (id: string, data: Partial<T>, file?: File) => Promise<boolean>;
//   delete: (id: string, softDelete?: boolean) => Promise<boolean>;
//   getActive: () => T[];
//   getById: (id: string) => T | undefined;
// }

// const createEntitySlice = <T extends EntityBase>(
//   entityName: EntityName,
//   set: any,
//   get: any
// ) => {
//   const idField = entityIdFields[entityName];

//   return {
//     data: [] as T[],
//     loading: false,
//     error: null,
//     pagination: {
//       page: 1,
//       pageSize: 10,
//       total: 0,
//     },

//     fetch: async (query: Record<string, any> = {}) => {
//       set({ loading: true, error: null });
//       try {
//         const queryString = new URLSearchParams(query).toString();
//         const res = await fetch(`/api/${entityName}?${queryString}`);
//         const { data, total } = await res.json();
//         set({ 
//           data,
//           pagination: { ...get().pagination, total },
//           loading: false 
//         });
//       } catch (error) {
//         set({ error: error.message, loading: false });
//       }
//     },

//     create: async (data: Partial<T>, file?: File) => {
//       set({ loading: true, error: null });
//       try {
//         let body = data;
//         if (file) {
//           const pictureUrl = await uploadFile(file);
//           body = { ...data, picture: pictureUrl };
//         }

//         const res = await fetch(`/api/${entityName}`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(body),
//         });
//         const newItem = await res.json();
//         set(state => ({ 
//           data: [newItem, ...state.data],
//           loading: false 
//         }));
//         return newItem;
//       } catch (error) {
//         set({ error: error.message, loading: false });
//         return null;
//       }
//     },

//     update: async (id: string, data: Partial<T>, file?: File) => {
//       set({ loading: true, error: null });
//       try {
//         let body = data;
//         if (file) {
//           const pictureUrl = await uploadFile(file);
//           body = { ...data, picture: pictureUrl };
//         }

//         const res = await fetch(`/api/${entityName}/${id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(body),
//         });
//         const updatedItem = await res.json();
        
//         set(state => ({
//           data: state.data.map(item => 
//             item[idField] === id ? updatedItem : item
//           ),
//           loading: false
//         }));
//         return true;
//       } catch (error) {
//         set({ error: error.message, loading: false });
//         return false;
//       }
//     },

//     delete: async (id: string, softDelete = true) => {
//       set({ loading: true, error: null });
//       try {
//         if (softDelete) {
//           await fetch(`/api/${entityName}/${id}`, {
//             method: 'PATCH',
//             body: JSON.stringify({ status: 'inactive' }),
//           });
//           set(state => ({
//             data: state.data.map(item => 
//               item[idField] === id ? { ...item, status: 'inactive' } : item
//             ),
//             loading: false
//           }));
//         } else {
//           await fetch(`/api/${entityName}/${id}`, { method: 'DELETE' });
//           set(state => ({
//             data: state.data.filter(item => item[idField] !== id),
//             loading: false
//           }));
//         }
//         return true;
//       } catch (error) {
//         set({ error: error.message, loading: false });
//         return false;
//       }
//     },

//     getActive: () => {
//       return get().data.filter((item: T) => 
//         ['active', 'approved', 'paid'].includes(item.status)
//       );
//     },

//     getById: (id: string) => {
//       return get().data.find((item: T) => item[idField] === id);
//     },
//   };
// };

// interface AppState {
//     me: EntityState<Auth> & {
//       login: (credentials: { email: string; password: string }) => Promise<boolean>;
//       logout: () => void;
//     };
//     entities: {
//       [K in keyof EntityMap]: EntityState<EntityMap[K]> & EntityActions<EntityMap[K]>;
//     };
//     clearErrors: () => void;
//   }
  
//   export const useAppStore = create<AppState>()(
//     devtools(
//       (set, get) => ({
//         me: {
//           data: [],
//           loading: false,
//           error: null,
//           pagination: { page: 1, pageSize: 10, total: 0 },
          
//           login: async (credentials) => {
//             set({ me: { ...get().me, loading: true, error: null } });
//             try {
//               const res = await fetch('/api/auth/login', {
//                 method: 'POST',
//                 body: JSON.stringify(credentials),
//               });
//               const data = await res.json();
//               set({ me: { ...get().me, data: [data], loading: false } });
//               return true;
//             } catch (error) {
//               set({ me: { ...get().me, error: error.message, loading: false } });
//               return false;
//             }
//           },
          
//           logout: () => {
//             set({ me: { data: [], loading: false, error: null, pagination: get().me.pagination } });
//           }
//         },
        
//         entities: {
//           categories: createEntitySlice<Category>('categories', set, get),
//           products: createEntitySlice<Product>('products', set, get),
//           customers: createEntitySlice<Customer>('customers', set, get),
//           sales: createEntitySlice<Sale>('sales', set, get),
//           carts: createEntitySlice<Cart>('carts', set, get),
//           employees: createEntitySlice<Employee>('employees', set, get),
//           departments: createEntitySlice<Department>('departments', set, get),
//           positions: createEntitySlice<Position>('positions', set, get),
//           auth: createEntitySlice<Auth>('auth', set, get),
//         },
        
//         clearErrors: () => {
//           set(state => ({
//             me: { ...state.me, error: null },
//             entities: Object.fromEntries(
//               Object.entries(state.entities).map(([key, value]) => [
//                 key,
//                 { ...value, error: null }
//               ])
//             ) as AppState['entities']
//           }));
//         },
//       }),
//       { name: 'app-store' }
//     )
//   );
  
//   async function uploadFile(file: File): Promise<string> {
//     const formData = new FormData();
//     formData.append('file', file);
//     const res = await fetch('/api/upload', { method: 'POST', body: formData });
//     const { url } = await res.json();
//     return url;
//   }