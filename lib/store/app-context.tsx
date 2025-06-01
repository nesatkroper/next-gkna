"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Category, Product } from "../generated/prisma"

// Define types for our state


interface AppState {
  categories: Category[]
  products: Product[]
  loading: {
    categories: boolean
    products: boolean
  }
  error: {
    categories: string | null
    products: string | null
  }
}

interface AppContextType {
  state: AppState
  fetchCategories: () => Promise<void>
  fetchProducts: () => Promise<void>
  addProduct: (productData: Partial<Product>, file?: File | null) => Promise<Product | null>
  addCategory: (categoryData: Partial<Category>, file?: File | null) => Promise<Category | null>
}

const initialState: AppState = {
  categories: [],
  products: [],
  loading: {
    categories: false,
    products: false,
  },
  error: {
    categories: null,
    products: null,
  },
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  // Upload a file and get the URL
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Upload error:", error)
      throw error
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, categories: true },
      error: { ...prev.error, categories: null },
    }))

    try {
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      const categories = Array.isArray(data) ? data : data.categories || []

      setState((prev) => ({
        ...prev,
        categories,
        loading: { ...prev.loading, categories: false },
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, categories: false },
        error: { ...prev.error, categories: error.message },
      }))
    }
  }

  // Fetch products
  const fetchProducts = async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, products: true },
      error: { ...prev.error, products: null },
    }))

    try {
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      const products = Array.isArray(data) ? data : data.products || []

      setState((prev) => ({
        ...prev,
        products,
        loading: { ...prev.loading, products: false },
      }))
    } catch (error) {
      console.error("Error fetching products:", error)
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, products: false },
        error: { ...prev.error, products: error.message },
      }))
    }
  }

  // Add a product
  const addProduct = async (productData: Partial<Product>, file?: File | null): Promise<Product | null> => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, products: true },
      error: { ...prev.error, products: null },
    }))

    try {
      let pictureUrl = ""
      if (file) {
        pictureUrl = await uploadFile(file)
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          picture: pictureUrl || productData.picture,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create product")
      }

      const newProduct = await response.json()

      // Update state with new product
      setState((prev) => ({
        ...prev,
        products: [newProduct, ...prev.products],
        loading: { ...prev.loading, products: false },
      }))

      return newProduct
    } catch (error) {
      console.error("Error adding product:", error)
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, products: false },
        error: { ...prev.error, products: error.message },
      }))
      return null
    }
  }

  // Add a category
  const addCategory = async (categoryData: Partial<Category>, file?: File | null): Promise<Category | null> => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, categories: true },
      error: { ...prev.error, categories: null },
    }))

    try {
      let pictureUrl = ""
      if (file) {
        pictureUrl = await uploadFile(file)
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryData,
          picture: pictureUrl || categoryData.picture,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create category")
      }

      const newCategory = await response.json()

      // Update state with new category
      setState((prev) => ({
        ...prev,
        categories: [newCategory, ...prev.categories],
        loading: { ...prev.loading, categories: false },
      }))

      return newCategory
    } catch (error) {
      console.error("Error adding category:", error)
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, categories: false },
        error: { ...prev.error, categories: error.message },
      }))
      return null
    }
  }

  // Initialize data on first load
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const value = {
    state,
    fetchCategories,
    fetchProducts,
    addProduct,
    addCategory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
