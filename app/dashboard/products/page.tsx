// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// import { FileUpload } from "@/components/ui/file-upload"
// import { uploadFile } from "@/lib/file-upload"
// import { DataTable, type ColumnType } from "@/components/ui/data-table"
// import { DataCards, type CardFieldType } from "@/components/ui/data-cards"
// import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
// import { Loader2, Plus } from "lucide-react"
// import { Category, Product } from "@/lib/generated/prisma"

// // Generate a unique product code
// function generateProductCode() {
//   const timestamp = Date.now().toString(36).substring(0, 6)
//   const random = Math.random().toString(36).substring(2, 5)
//   return `PRD-${timestamp}-${random}`.toUpperCase()
// }

// interface FormData {
//   id?: string
//   productName: string
//   productCode: string
//   categoryId: string
//   picture: string | null
//   unit: string
//   capacity: string
//   sellPrice: number
//   costPrice: number
//   discountRate: number
//   desc: string | null
// }

// export default function ProductsPage() {
//   const { toast } = useToast()
//   const [isLoading, setIsLoading] = useState(true)
//   const [products, setProducts] = useState<Product[]>([])
//   const [categories, setCategories] = useState<Category[]>([])
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [file, setFile] = useState<File | null>(null)
//   const [aspectRatio, setAspectRatio] = useState<string>("1:1")
//   const [viewMode, setViewMode] = useState<ViewMode>("table")
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
//   const [productToDelete, setProductToDelete] = useState<Product | null>(null)

//   const [formData, setFormData] = useState<FormData>({
//     productName: "",
//     productCode: generateProductCode(),
//     categoryId: "",
//     picture: null,
//     unit: "",
//     capacity: "",
//     sellPrice: 0,
//     costPrice: 0,
//     discountRate: 0,
//     desc: null,
//   })

//   // Load products and categories
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true)
//       try {
//         const [productsRes, categoriesRes] = await Promise.all([fetch("/api/products"), fetch("/api/categories")])

//         if (!productsRes.ok || !categoriesRes.ok) {
//           throw new Error("Failed to fetch data")
//         }

//         const productsData = await productsRes.json()
//         const categoriesData = await categoriesRes.json()

//         setProducts(productsData)
//         setCategories(categoriesData)
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load data. Please try again.",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [toast])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: ["sellPrice", "costPrice", "discountRate"].includes(name) ? Number.parseFloat(value) || 0 : value,
//     }))
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleFileSelect = (selectedFile: File | null, selectedAspectRatio?: string) => {
//     setFile(selectedFile)
//     if (selectedAspectRatio) {
//       setAspectRatio(selectedAspectRatio)
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       productName: "",
//       productCode: generateProductCode(),
//       categoryId: "",
//       picture: null,
//       unit: "",
//       capacity: "",
//       sellPrice: 0,
//       costPrice: 0,
//       discountRate: 0,
//       desc: null,
//     })
//     setFile(null)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     try {
//       let pictureUrl = formData.picture

//       if (file) {
//         pictureUrl = await uploadFile(file, { aspectRatio: aspectRatio as any })
//       }

//       const productData = {
//         ...formData,
//         picture: pictureUrl,
//         updatedAt: new Date().toISOString(), // Add updatedAt field to fix the Prisma error
//       }

//       const isEditing = !!formData.id
//       const url = isEditing ? `/api/products/${formData.id}` : "/api/products"
//       const method = isEditing ? "PUT" : "POST"

//       const response = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(productData),
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.message || "Failed to save product")
//       }

//       const savedProduct = await response.json()

//       setProducts((prev) =>
//         isEditing ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)) : [...prev, savedProduct],
//       )

//       toast({
//         title: isEditing ? "Product Updated" : "Product Created",
//         description: `${savedProduct.productName} has been ${isEditing ? "updated" : "created"} successfully.`,
//       })

//       setIsDialogOpen(false)
//       resetForm()
//     } catch (error) {
//       console.error("Error saving product:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to save product",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleEdit = (product: Product) => {
//     setFormData({
//       id: product.id,
//       productName: product.productName,
//       productCode: product.productCode,
//       categoryId: product.categoryId,
//       picture: product.picture,
//       unit: product.unit,
//       capacity: product.capacity,
//       sellPrice: product.sellPrice,
//       costPrice: product.costPrice,
//       discountRate: product.discountRate,
//       desc: product.desc,
//     })
//     setIsDialogOpen(true)
//   }

//   const handleDelete = (product: Product) => {
//     setProductToDelete(product)
//     setIsDeleteDialogOpen(true)
//   }

//   const confirmDelete = async () => {
//     if (!productToDelete) return

//     try {
//       const response = await fetch(`/api/products/${productToDelete.id}`, {
//         method: "DELETE",
//       })

//       if (!response.ok) {
//         throw new Error("Failed to delete product")
//       }

//       setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))

//       toast({
//         title: "Product Deleted",
//         description: `${productToDelete.productName} has been deleted.`,
//       })
//     } catch (error) {
//       console.error("Error deleting product:", error)
//       toast({
//         title: "Error",
//         description: "Failed to delete product",
//         variant: "destructive",
//       })
//     } finally {
//       setIsDeleteDialogOpen(false)
//       setProductToDelete(null)
//     }
//   }

//   const refreshData = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/products")
//       if (!response.ok) {
//         throw new Error("Failed to fetch products")
//       }
//       const data = await response.json()
//       setProducts(data)
//       toast({
//         title: "Refreshed",
//         description: "Product list has been updated.",
//       })
//     } catch (error) {
//       console.error("Error refreshing data:", error)
//       toast({
//         title: "Error",
//         description: "Failed to refresh data",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Table columns configuration
//   const tableColumns: ColumnType[] = [
//     {
//       key: "picture",
//       label: "Image",
//       type: "image",
//       width: "100px",
//     },
//     {
//       key: "productName",
//       label: "Product Name",
//     },
//     {
//       key: "productCode",
//       label: "Code",
//     },
//     {
//       key: "Category",
//       label: "Category",
//       render: (value) => value?.categoryName || "N/A",
//     },
//     {
//       key: "unit",
//       label: "Unit",
//     },
//     {
//       key: "capacity",
//       label: "Capacity",
//     },
//     {
//       key: "sellPrice",
//       label: "Sell Price",
//       type: "currency",
//       align: "right",
//     },
//     {
//       key: "costPrice",
//       label: "Cost Price",
//       type: "currency",
//       align: "right",
//     },
//   ]

//   // Card fields configuration
//   const cardFields: CardFieldType[] = [
//     {
//       key: "picture",
//       type: "image",
//     },
//     {
//       key: "productName",
//       primary: true,
//     },
//     {
//       key: "productCode",
//       secondary: true,
//     },
//     {
//       key: "Category",
//       label: "Category",
//       render: (value) => value?.categoryName || "N/A",
//     },
//     {
//       key: "unit",
//       label: "Unit",
//     },
//     {
//       key: "capacity",
//       label: "Capacity",
//     },
//     {
//       key: "sellPrice",
//       label: "Sell Price",
//       type: "currency",
//     },
//     {
//       key: "costPrice",
//       label: "Cost Price",
//       type: "currency",
//     },
//   ]

//   return (
//     <div className="space-y-4 p-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Products</h1>
//         <div className="flex items-center gap-4">
//           <ViewToggle view={viewMode} onViewChange={setViewMode} />
//           <Button onClick={() => setIsDialogOpen(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         </div>
//       </div>

//       {viewMode === "table" ? (
//         <DataTable
//           data={products}
//           columns={tableColumns}
//           idField="id"
//           isLoading={isLoading}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onRefresh={refreshData}
//           emptyMessage="No products found. Add your first product!"
//         />
//       ) : (
//         <DataCards
//           data={products}
//           fields={cardFields}
//           idField="id"
//           isLoading={isLoading}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onRefresh={refreshData}
//           columns={3}
//           emptyMessage="No products found. Add your first product!"
//         />
//       )}

//       {/* Product Form Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{formData.id ? "Edit Product" : "Add New Product"}</DialogTitle>
//             <DialogDescription>
//               {formData.id
//                 ? "Update the product details below."
//                 : "Fill in the product details below to add a new product."}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="productName">Product Name *</Label>
//                 <Input
//                   id="productName"
//                   name="productName"
//                   value={formData.productName}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="productCode">Product Code *</Label>
//                 <Input
//                   id="productCode"
//                   name="productCode"
//                   value={formData.productCode}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="categoryId">Category *</Label>
//                 <Select
//                   value={formData.categoryId}
//                   onValueChange={(value) => handleSelectChange("categoryId", value)}
//                   required
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((category) => (
//                       <SelectItem key={category.id} value={category.id}>
//                         {category.categoryName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="unit">Unit *</Label>
//                 <Input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="capacity">Capacity *</Label>
//                 <Input id="capacity" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="sellPrice">Sell Price *</Label>
//                 <Input
//                   id="sellPrice"
//                   name="sellPrice"
//                   type="number"
//                   step="0.01"
//                   value={formData.sellPrice}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="costPrice">Cost Price *</Label>
//                 <Input
//                   id="costPrice"
//                   name="costPrice"
//                   type="number"
//                   step="0.01"
//                   value={formData.costPrice}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="discountRate">Discount Rate (%)</Label>
//                 <Input
//                   id="discountRate"
//                   name="discountRate"
//                   type="number"
//                   step="0.01"
//                   value={formData.discountRate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="picture">Product Image</Label>
//               <FileUpload
//                 value={file}
//                 onFileSelect={handleFileSelect}
//                 placeholder="Upload product image"
//                 showAspectRatioSelector={true}
//               />
//               {!file && formData.picture && (
//                 <div className="mt-2">
//                   <p className="text-sm text-muted-foreground mb-1">Current image:</p>
//                   <div className="relative w-32 h-32 rounded-md overflow-hidden">
//                     <img
//                       src={formData.picture || "/placeholder.svg"}
//                       alt="Current product"
//                       className="object-cover w-full h-full"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="desc">Description</Label>
//               <Textarea id="desc" name="desc" value={formData.desc || ""} onChange={handleInputChange} rows={3} />
//             </div>
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {formData.id ? "Update Product" : "Add Product"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Confirm Deletion</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete the product "{productToDelete?.productName}"? This action cannot be
//               undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={confirmDelete}>
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react"
import { useAppStore } from "@/lib/store/use-app-store"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    isCreatingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    productsError,
    categoriesError,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    getActiveCategories,
    getActiveProducts,
    clearErrors,
  } = useAppStore()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // Load data only once on mount
  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories) {
      fetchCategories()
    }
    if (products.length === 0 && !isLoadingProducts) {
      fetchProducts()
    }
  }, [])

  const activeCategories = getActiveCategories()
  const activeProducts = getActiveProducts()

  const filteredProducts = activeProducts.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "productName",
      label: "Product",
      type: "image" as const,
    },
    {
      key: "Category.categoryName",
      label: "Category",
      render: (value: any, row: any) => row.Category?.categoryName || "Unknown",
    },
    {
      key: "unit_capacity",
      label: "Unit/Capacity",
      render: (value: any, row: any) => {
        if (row.unit && row.capacity) return `${row.capacity} ${row.unit}`
        return row.unit || row.capacity || "-"
      },
    },
    {
      key: "costPrice",
      label: "Cost Price",
      type: "currency" as const,
    },
    {
      key: "sellPrice",
      label: "Sell Price",
      type: "currency" as const,
    },
    {
      key: "Stock.quantity",
      label: "Stock",
      type: "badge" as const,
      render: (value: any, row: any) => row.Stock?.quantity || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
  ]

  // Card fields configuration
  const cardFields = [
    {
      key: "picture",
      type: "image" as const,
    },
    {
      key: "productName",
      primary: true,
    },
    {
      key: "productCode",
      secondary: true,
    },
    {
      key: "Category.categoryName",
      label: "Category",
      render: (value: any, row: any) => row.Category?.categoryName || "Unknown",
    },
    {
      key: "costPrice",
      label: "Cost",
      type: "currency" as const,
    },
    {
      key: "sellPrice",
      label: "Price",
      type: "currency" as const,
    },
    {
      key: "Stock.quantity",
      label: "Stock",
      type: "badge" as const,
      render: (value: any, row: any) => row.Stock?.quantity || 0,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const productData = {
      productName: formData.get("productName") as string,
      productCode: formData.get("productCode") as string,
      categoryId: formData.get("categoryId") as string,
      unit: formData.get("unit") as string,
      capacity: formData.get("capacity") as string,
      sellPrice: Number.parseFloat(formData.get("sellPrice") as string),
      costPrice: Number.parseFloat(formData.get("costPrice") as string),
      discountRate: Number.parseInt(formData.get("discountRate") as string) || 0,
      desc: formData.get("desc") as string,
    }

    const success = editingProduct
      ? await updateProduct(editingProduct.productId, productData, selectedFile)
      : await createProduct(productData, selectedFile)

    if (success) {
      toast({
        title: "Success",
        description: `Product ${editingProduct ? "updated" : "created"} successfully`,
      })
      setIsDialogOpen(false)
      setSelectedFile(null)
      setEditingProduct(null)
        ; (e.target as HTMLFormElement).reset()
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? "update" : "create"} product`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const success = await deleteProduct(productId)
    if (success) {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    clearErrors()
    fetchProducts()
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your fertilizer inventory and product catalog</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoadingProducts || isLoadingCategories}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingProducts || isLoadingCategories ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setSelectedFile(null)
                setEditingProduct(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={activeCategories.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product information" : "Create a new product in your inventory"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      name="productName"
                      required
                      defaultValue={editingProduct?.productName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code (Auto-generated)</Label>
                    <Input
                      id="productCode"
                      name="productCode"
                      placeholder="Leave empty to auto-generate"
                      defaultValue={editingProduct?.productCode || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    accept="image/*"
                    maxSize={5}
                    preview={true}
                    value={selectedFile}
                    placeholder="Upload product image"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select name="categoryId" required defaultValue={editingProduct?.categoryId || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategories.length > 0 ? (
                        activeCategories.map((category) => (
                          <SelectItem key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="kg, lbs, etc."
                      defaultValue={editingProduct?.unit || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      placeholder="50kg, 25lbs, etc."
                      defaultValue={editingProduct?.capacity || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price *</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingProduct?.costPrice || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellPrice">Sell Price *</Label>
                    <Input
                      id="sellPrice"
                      name="sellPrice"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingProduct?.sellPrice || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountRate">Discount %</Label>
                    <Input
                      id="discountRate"
                      name="discountRate"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingProduct?.discountRate || 0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" name="desc" rows={3} defaultValue={editingProduct?.desc || ""} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingProduct || isUpdatingProduct}>
                    {isCreatingProduct || isUpdatingProduct ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? "Updating..." : "Creating..."}
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(productsError || categoriesError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{productsError || categoriesError}</p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Inventory
                {isLoadingProducts && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredProducts.length} products in your catalog</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredProducts}
              fields={cardFields}
              loading={isLoadingProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="productId"
              imageField="picture"
              nameField="productName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredProducts}
              columns={tableColumns}
              loading={isLoadingProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="productId"
              imageField="picture"
              nameField="productName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

