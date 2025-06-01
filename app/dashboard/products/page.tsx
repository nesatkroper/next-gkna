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



// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { FileUpload } from "@/components/ui/file-upload"
// import { ViewToggle } from "@/components/ui/view-toggle"
// import { ProductCard } from "@/components/ui/product-card"
// import { Plus, Search, Package, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
// import { formatCurrency } from "@/lib/utils"
// import { useAppStore } from "@/lib/store/use-app-store"
// import { useToast } from "@/components/ui/use-toast"

// export default function ProductsPage() {
//   const {
//     products,
//     categories,
//     isLoadingProducts,
//     isLoadingCategories,
//     isCreatingProduct,
//     isUpdatingProduct,
//     isDeletingProduct,
//     productsError,
//     categoriesError,
//     fetchProducts,
//     fetchCategories,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     getActiveCategories,
//     getActiveProducts,
//     clearErrors,
//   } = useAppStore()

//   const { toast } = useToast()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [view, setView] = useState<"table" | "card">("table")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [editingProduct, setEditingProduct] = useState<any>(null)

//   // Load data only once on mount
//   useEffect(() => {
//     if (categories.length === 0 && !isLoadingCategories) {
//       fetchCategories()
//     }
//     if (products.length === 0 && !isLoadingProducts) {
//       fetchProducts()
//     }
//   }, [])

//   const activeCategories = getActiveCategories()
//   const activeProducts = getActiveProducts()

//   const filteredProducts = activeProducts.filter(
//     (product) =>
//       product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     const formData = new FormData(e.currentTarget)
//     const productData = {
//       productName: formData.get("productName") as string,
//       productCode: formData.get("productCode") as string,
//       categoryId: formData.get("categoryId") as string,
//       unit: formData.get("unit") as string,
//       capacity: formData.get("capacity") as string,
//       sellPrice: Number.parseFloat(formData.get("sellPrice") as string),
//       costPrice: Number.parseFloat(formData.get("costPrice") as string),
//       discountRate: Number.parseInt(formData.get("discountRate") as string) || 0,
//       desc: formData.get("desc") as string,
//     }

//     const success = editingProduct
//       ? await updateProduct(editingProduct.productId, productData, selectedFile)
//       : await createProduct(productData, selectedFile)

//     if (success) {
//       toast({
//         title: "Success",
//         description: `Product ${editingProduct ? "updated" : "created"} successfully`,
//       })
//       setIsDialogOpen(false)
//       setSelectedFile(null)
//       setEditingProduct(null)
//         ; (e.target as HTMLFormElement).reset()
//     } else {
//       toast({
//         title: "Error",
//         description: `Failed to ${editingProduct ? "update" : "create"} product`,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleEdit = (product: any) => {
//     setEditingProduct(product)
//     setSelectedFile(null)
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (productId: string) => {
//     if (!confirm("Are you sure you want to delete this product?")) return

//     const success = await deleteProduct(productId)
//     if (success) {
//       toast({
//         title: "Success",
//         description: "Product deleted successfully",
//       })
//     } else {
//       toast({
//         title: "Error",
//         description: "Failed to delete product",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleRetry = () => {
//     clearErrors()
//     fetchProducts()
//     fetchCategories()
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Products</h1>
//           <p className="text-muted-foreground">Manage your fertilizer inventory and product catalog</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={isLoadingProducts || isLoadingCategories}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingProducts || isLoadingCategories ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open)
//               if (!open) {
//                 setSelectedFile(null)
//                 setEditingProduct(null)
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button disabled={activeCategories.length === 0}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Product
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
//                 <DialogDescription>
//                   {editingProduct ? "Update product information" : "Create a new product in your inventory"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="productName">Product Name *</Label>
//                     <Input
//                       id="productName"
//                       name="productName"
//                       required
//                       defaultValue={editingProduct?.productName || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="productCode">Product Code (Auto-generated)</Label>
//                     <Input
//                       id="productCode"
//                       name="productCode"
//                       placeholder="Leave empty to auto-generate"
//                       defaultValue={editingProduct?.productCode || ""}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Product Image</Label>
//                   <FileUpload
//                     onFileSelect={setSelectedFile}
//                     accept="image/*"
//                     maxSize={5}
//                     preview={true}
//                     value={selectedFile || editingProduct?.picture}
//                     placeholder="Upload product image"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="categoryId">Category *</Label>
//                   <Select name="categoryId" required defaultValue={editingProduct?.categoryId || ""}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {activeCategories.length > 0 ? (
//                         activeCategories.map((category) => (
//                           <SelectItem key={category.categoryId} value={category.categoryId}>
//                             {category.categoryName}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem value="no-categories" disabled>
//                           No categories available
//                         </SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="unit">Unit</Label>
//                     <Input
//                       id="unit"
//                       name="unit"
//                       placeholder="kg, lbs, etc."
//                       defaultValue={editingProduct?.unit || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="capacity">Capacity</Label>
//                     <Input
//                       id="capacity"
//                       name="capacity"
//                       placeholder="50kg, 25lbs, etc."
//                       defaultValue={editingProduct?.capacity || ""}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="costPrice">Cost Price *</Label>
//                     <Input
//                       id="costPrice"
//                       name="costPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.costPrice || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="sellPrice">Sell Price *</Label>
//                     <Input
//                       id="sellPrice"
//                       name="sellPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.sellPrice || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="discountRate">Discount %</Label>
//                     <Input
//                       id="discountRate"
//                       name="discountRate"
//                       type="number"
//                       min="0"
//                       max="100"
//                       defaultValue={editingProduct?.discountRate || 0}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="desc">Description</Label>
//                   <Textarea id="desc" name="desc" rows={3} defaultValue={editingProduct?.desc || ""} />
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={isCreatingProduct || isUpdatingProduct}>
//                     {isCreatingProduct || isUpdatingProduct ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingProduct ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingProduct ? (
//                       "Update Product"
//                     ) : (
//                       "Create Product"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {/* Error Display */}
//       {(productsError || categoriesError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">Error loading data</p>
//                 <p className="text-sm text-muted-foreground">{productsError || categoriesError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry}>
//                 Try Again
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 Product Inventory
//                 {isLoadingProducts && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredProducts.length} products in your catalog</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {isLoadingProducts
//                 ? Array.from({ length: 8 }).map((_, i) => (
//                   <Card key={i} className="animate-pulse">
//                     <CardContent className="p-4">
//                       <div className="aspect-square bg-muted rounded-lg mb-3" />
//                       <div className="space-y-2">
//                         <div className="h-4 bg-muted rounded w-3/4" />
//                         <div className="h-3 bg-muted rounded w-1/2" />
//                         <div className="h-3 bg-muted rounded w-2/3" />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))
//                 : filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product.productId}
//                     product={product}
//                     onEdit={handleEdit}
//                     onDelete={handleDelete}
//                   />
//                 ))}
//             </div>
//           ) : (
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Product</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Unit/Capacity</TableHead>
//                     <TableHead>Cost Price</TableHead>
//                     <TableHead>Sell Price</TableHead>
//                     <TableHead>Stock</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoadingProducts ? (
//                     Array.from({ length: 5 }).map((_, i) => (
//                       <TableRow key={i}>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <div className="h-16 w-16 rounded-md bg-muted animate-pulse" />
//                             <div className="space-y-2">
//                               <div className="h-4 w-32 bg-muted animate-pulse rounded" />
//                               <div className="h-3 w-24 bg-muted animate-pulse rounded" />
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-4 w-20 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-4 w-16 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-4 w-16 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-4 w-16 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-6 w-12 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-6 w-16 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                         <TableCell>
//                           <div className="h-8 w-20 bg-muted animate-pulse rounded" />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : filteredProducts.length > 0 ? (
//                     filteredProducts.map((product) => (
//                       <TableRow key={product.productId} className="group">
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             {product.picture ? (
//                               <img
//                                 src={product.picture || "/placeholder.svg"}
//                                 alt={product.productName}
//                                 className="h-16 w-16 rounded-md object-cover"
//                               />
//                             ) : (
//                               <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
//                                 <Package className="h-8 w-8 text-muted-foreground" />
//                               </div>
//                             )}
//                             <div>
//                               <div className="font-medium">{product.productName}</div>
//                               {product.productCode && (
//                                 <div className="text-sm text-muted-foreground">{product.productCode}</div>
//                               )}
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>{product.Category?.categoryName || "Unknown"}</TableCell>
//                         <TableCell>
//                           {product.unit && product.capacity
//                             ? `${product.capacity} ${product.unit}`
//                             : product.unit || product.capacity || "-"}
//                         </TableCell>
//                         <TableCell>{formatCurrency(product.costPrice)}</TableCell>
//                         <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
//                         <TableCell>
//                           <Badge
//                             variant={
//                               (product.Stock?.quantity || 0) < 10
//                                 ? "destructive"
//                                 : (product.Stock?.quantity || 0) < 50
//                                   ? "secondary"
//                                   : "default"
//                             }
//                           >
//                             {product.Stock?.quantity || 0}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant={product.status === "active" ? "default" : "secondary"}>
//                             {product.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleDelete(product.productId)}
//                               disabled={isDeletingProduct}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                         No products found. Add your first product!
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

