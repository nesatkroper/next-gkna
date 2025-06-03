import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Department } from "@/lib/generated/prisma"



export interface CreateDepartmentData {
  departmentName: string
  departmentCode?: string
  memo?: string
}

export type DepartmentStore = BaseStore<Department, CreateDepartmentData>

export const useDepartmentStore = create<DepartmentStore>()(
  devtools(
    createBaseStore<Department, CreateDepartmentData>({
      endpoint: "/api/departments",
      entityName: "departments",
      idField: "departmentId",
    }),
    { name: "department-store" },
  ),
)
