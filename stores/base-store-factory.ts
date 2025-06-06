import type { StateCreator } from "zustand"
import type { BaseEntity, BaseStore } from "@/types/store-types"
import { uploadFile } from "@/utils/file-upload"

interface StoreConfig {
  endpoint: string
  entityName: string
  idField: string
  imageFields?: string[]
}

export function createBaseStore<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>>(
  config: StoreConfig,
): StateCreator<BaseStore<T, CreateData, UpdateData>> {
  return (set, get) => ({
    items: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    // Actions
    fetch: async () => {
      const { isLoading } = get()
      if (isLoading) return

      set({ isLoading: true, error: null })

      try {
        const response = await fetch(config.endpoint)
        if (!response.ok) throw new Error(`Failed to fetch ${config.entityName}`)

        const data = await response.json()
        const items = Array.isArray(data) ? data : data[config.entityName] || []

        set({ items, isLoading: false })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        set({
          error: errorMessage,
          isLoading: false,
        })
      }
    },

    create: async (itemData: CreateData, file?: File) => {
      set({ isCreating: true, error: null })

      try {
        const dataToSend = { ...itemData } as any

        if (file && config.imageFields && config.imageFields.length > 0) {
          const imageField = config.imageFields[0]
          const pictureUrl = await uploadFile(file)
          dataToSend[imageField] = pictureUrl
        }

        const response = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to create ${config.entityName}`)
        }

        const newItem = await response.json()

        set((state) => ({
          items: [newItem, ...state.items],
          isCreating: false,
        }))

        return true
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        set({
          error: errorMessage,
          isCreating: false,
        })
        return false
      }
    },

    update: async (id: string, itemData: UpdateData, file?: File) => {
      set({ isUpdating: true, error: null })

      try {
        const dataToSend = { ...itemData } as any

        if (file && config.imageFields && config.imageFields.length > 0) {
          const imageField = config.imageFields[0]
          const pictureUrl = await uploadFile(file)
          dataToSend[imageField] = pictureUrl
        }

        const response = await fetch(`${config.endpoint}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update ${config.entityName}`)
        }

        const updatedItem = await response.json()

        set((state) => ({
          items: state.items.map((item) => ((item as any)[config.idField] === id ? updatedItem : item)),
          isUpdating: false,
        }))

        return true
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        set({
          error: errorMessage,
          isUpdating: false,
        })
        return false
      }
    },

    delete: async (id: string) => {
      set({ isDeleting: true, error: null })

      try {
        const response = await fetch(`${config.endpoint}/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to delete ${config.entityName}`)
        }

        set((state) => ({
          items: state.items.filter((item) => (item as any)[config.idField] !== id),
          isDeleting: false,
        }))

        return true
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        set({
          error: errorMessage,
          isDeleting: false,
        })
        return false
      }
    },

    clearError: () => {
      set({ error: null })
    },

    getActiveItems: () => {
      return get().items.filter((item) => item.status === "active")
    },
  })
}

