import { create } from "zustand"

interface Employee {
  employeeId: string
  employeeCode?: string | null
  firstName: string
  lastName: string
  gender: "male" | "female"
  dob?: string | null
  phone?: string | null
  positionId: string
  branchId?: string | null
  departmentId: string
  salary: number
  hiredDate?: string | null
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  Department?: { departmentId: string; name: string } | null
  Position?: { positionId: string; name: string } | null
  Branch?: { branchId: string; branchName: string } | null
}

interface EmployeeStore {
  items: Employee[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (data: Partial<Employee>) => Promise<boolean>
  update: (id: string, data: Partial<Employee>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
      set({ items: Array.isArray(data) ? data : data?.employees || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch employees", isLoading: false })
    }
  },
  create: async (data) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create employee")
      }
      const newEmployee = await response.json()
      set((state) => ({ items: [...state.items, newEmployee] }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update employee")
      }
      const updatedEmployee = await response.json()
      set((state) => ({
        items: state.items.map((item) => (item.employeeId === id ? updatedEmployee : item)),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete employee")
      set((state) => ({
        items: state.items.filter((item) => item.employeeId !== id),
      }))
      return true
    } catch (error: any) {
      throw error
    }
  },
}))


// import { create } from "zustand"
// import { devtools } from "zustand/middleware"
// import { createBaseStore } from "./base-store-factory"
// import type { BaseStore } from "@/types/store-types"
// import { Employee } from "@/lib/generated/prisma"


// export interface CreateEmployeeData {
//   employeeCode?: string
//   firstName: string
//   lastName: string
//   gender?: "male" | "female" | "others"
//   dob?: Date
//   phone?: string
//   positionId: string
//   departmentId: string
//   salary: number
//   hiredDate?: Date
//   picture?: string
// }

// export type EmployeeStore = BaseStore<Employee, CreateEmployeeData>

// export const useEmployeeStore = create<EmployeeStore>()(
//   devtools(
//     createBaseStore<Employee, CreateEmployeeData>({
//       endpoint: "/api/employees",
//       entityName: "employees",
//       idField: "employeeId",
//     }),
//     { name: "employee-store" },
//   ),
// )
