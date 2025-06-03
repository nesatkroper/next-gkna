export interface BaseEntity {
    status?: "active" | "inactive" | "pending" | "approved" | "rejected" | "cancelled"
    createdAt?: Date
    updatedAt?: Date
  }
  
  export interface LoadingStates {
    isLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
  }
  
  export interface ErrorState {
    error: string | null
  }
  
  export interface BaseStoreState<T extends BaseEntity> extends LoadingStates, ErrorState {
    items: T[]
    getActiveItems: () => T[]
  }
  
  export interface BaseStoreActions<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>> {
    fetch: () => Promise<void>
    create: (data: CreateData, file?: File) => Promise<boolean>
    update: (id: string, data: UpdateData, file?: File) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    clearError: () => void
  }
  
  export type BaseStore<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>> = BaseStoreState<T> &
    BaseStoreActions<T, CreateData, UpdateData>
  
  // Common types for image handling
  export interface WithImage {
    picture?: string
    imageUrl?: string
    govPicture?: string
  }
  
  // Common types for file uploads
  export interface FileUploadOptions {
    fieldName: string // The field name in the model that stores the image URL
    fileField?: string // Optional custom form field name
  }
  


// export interface BaseEntity {
//     status?: "active" | "inactive" | "pending" | "approved" | "rejected" | "cancelled"
//     createdAt?: Date
//     updatedAt?: Date
//   }
  
//   export interface LoadingStates {
//     isLoading: boolean
//     isCreating: boolean
//     isUpdating: boolean
//     isDeleting: boolean
//   }
  
//   export interface ErrorState {
//     error: string | null
//   }
  
//   export interface BaseStoreState<T extends BaseEntity> extends LoadingStates, ErrorState {
//     items: T[]
//     getActiveItems: () => T[]
//   }
  
//   export interface BaseStoreActions<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>> {
//     fetch: () => Promise<void>
//     create: (data: CreateData, file?: File) => Promise<boolean>
//     update: (id: string, data: UpdateData, file?: File) => Promise<boolean>
//     delete: (id: string) => Promise<boolean>
//     clearError: () => void
//   }
  
//   export type BaseStore<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>> = BaseStoreState<T> &
//     BaseStoreActions<T, CreateData, UpdateData>
  