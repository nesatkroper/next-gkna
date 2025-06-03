import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"
import type { BaseStore } from "@/types/store-types"
import { Role } from "@/lib/generated/prisma"

export interface CreateRoleData {
  name: string
  description?: string
  isSystemRole?: boolean
}

export type RoleStore = BaseStore<Role, CreateRoleData>

export const useRoleStore = create<RoleStore>()(
  devtools(
    createBaseStore<Role, CreateRoleData>({
      endpoint: "/api/roles",
      entityName: "roles",
      idField: "roleId",
    }),
    { name: "role-store" },
  ),
)
