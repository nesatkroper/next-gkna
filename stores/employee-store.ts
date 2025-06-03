import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Employee } from "@/lib/generated/prisma"


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
