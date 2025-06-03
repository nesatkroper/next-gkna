import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"

export interface Employee {
  employeeId: string
  employeeCode?: string
  firstName: string
  lastName: string
  gender: "male" | "female" | "others"
  dob?: Date
  phone?: string
  positionId: string
  departmentId: string
  salary: number
  hiredDate?: Date
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface CreateEmployeeData {
  employeeCode?: string
  firstName: string
  lastName: string
  gender?: "male" | "female" | "others"
  dob?: Date
  phone?: string
  positionId: string
  departmentId: string
  salary: number
  hiredDate?: Date
  picture?: string
}

export type EmployeeStore = BaseStore<Employee, CreateEmployeeData>

export const useEmployeeStore = create<EmployeeStore>()(
  devtools(
    createBaseStore<Employee, CreateEmployeeData>({
      endpoint: "/api/employees",
      entityName: "employees",
      idField: "employeeId",
    }),
    { name: "employee-store" },
  ),
)
