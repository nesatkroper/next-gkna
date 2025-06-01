"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EnhancedTable, EnhancedTableRow, EnhancedTableCell } from "@/components/ui/enhanced-table"
import { TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ImageDisplay } from "@/components/ui/image-display"
import { Plus, Search, Package, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { uploadFile } from "@/lib/file-upload"

interface Product {
  productId: string
  productName: string
  productCode: string
  category: {
    categoryName: string
  }
  picture: string | null
  sellPrice: number
  costPrice: number
  unit: string
  capacity: string
  stocks?: {
    quantity: number
  }
  status: string
}

interface Category {
  categoryId: string
  categoryName: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData(e.currentTarget)
      let pictureUrl = ""

      if (selectedFile) {
        pictureUrl = await uploadFile(selectedFile)
      }

      const productData = {
        productName: formData.get("productName"),
        productCode: formData.get("productCode"),
        categoryId: formData.get("categoryId"),
        unit: formData.get("unit"),
        capacity: formData.get("capacity"),
        sellPrice: Number.parseFloat(formData.get("sellPrice") as string),
        costPrice: Number.parseFloat(formData.get("costPrice") as string),
        discountRate: Number.parseInt(formData.get("discountRate") as string) || 0,
        desc: formData.get("desc"),
        picture: pictureUrl,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setSelectedFile(null)
        fetchProducts()
          ; (e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Error adding product. Please try again.")
    } finally {
      setUploading(false)
    }
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

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setSelectedFile(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product in your inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" name="productName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input id="productCode" name="productCode" />
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
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" name="unit" placeholder="kg, lbs, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" name="capacity" placeholder="50kg, 25lbs, etc." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input id="costPrice" name="costPrice" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Sell Price</Label>
                  <Input id="sellPrice" name="sellPrice" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountRate">Discount %</Label>
                  <Input id="discountRate" name="discountRate" type="number" min="0" max="100" defaultValue="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" name="desc" rows={3} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Saving..." : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inventory
          </CardTitle>
          <CardDescription>{filteredProducts.length} products in your catalog</CardDescription>
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

          <EnhancedTable loading={loading}>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit/Capacity</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <EnhancedTableRow key={product.productId}>
                  <EnhancedTableCell>
                    <div className="flex items-center gap-3">
                      <ImageDisplay src={product.picture || "/placeholder.svg"} alt={product.productName} size="md" />
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        {product.productCode && (
                          <div className="text-sm text-muted-foreground">{product.productCode}</div>
                        )}
                      </div>
                    </div>
                  </EnhancedTableCell>
                  <EnhancedTableCell>{product.category.categoryName}</EnhancedTableCell>
                  <EnhancedTableCell>
                    {product.unit && product.capacity
                      ? `${product.capacity} ${product.unit}`
                      : product.unit || product.capacity || "-"}
                  </EnhancedTableCell>
                  <EnhancedTableCell>{formatCurrency(product.costPrice)}</EnhancedTableCell>
                  <EnhancedTableCell>{formatCurrency(product.sellPrice)}</EnhancedTableCell>
                  <EnhancedTableCell>
                    <Badge
                      variant={
                        (product.stocks?.quantity || 0) < 10
                          ? "destructive"
                          : (product.stocks?.quantity || 0) < 50
                            ? "secondary"
                            : "default"
                      }
                    >
                      {product.stocks?.quantity || 0}
                    </Badge>
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                  </EnhancedTableCell>
                  <EnhancedTableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </EnhancedTableCell>
                </EnhancedTableRow>
              ))}
            </TableBody>
          </EnhancedTable>
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
// import { Plus, Search, Package, Edit, Trash2 } from "lucide-react"
// import { formatCurrency } from "@/lib/utils"

// interface Product {
//   productId: string
//   productName: string
//   productCode: string
//   category: {
//     categoryName: string
//   }
//   sellPrice: number
//   costPrice: number
//   unit: string
//   capacity: string
//   stocks?: {
//     quantity: number
//   }
//   status: string
// }

// interface Category {
//   categoryId: string
//   categoryName: string
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([])
//   const [categories, setCategories] = useState<Category[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)

//   useEffect(() => {
//     fetchProducts()
//     fetchCategories()
//   }, [])

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch("/api/products")
//       const data = await response.json()
//       // Handle both array and object responses
//       setProducts(Array.isArray(data) ? data : data.products || [])
//     } catch (error) {
//       console.error("Error fetching products:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch("/api/categories")
//       const data = await response.json()
//       // Handle both array and object responses
//       setCategories(Array.isArray(data) ? data : data.categories || [])
//     } catch (error) {
//       console.error("Error fetching categories:", error)
//     }
//   }

//   const filteredProducts = products.filter(
//     (product) =>
//       product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)

//     const productData = {
//       productName: formData.get("productName"),
//       productCode: formData.get("productCode"),
//       categoryId: formData.get("categoryId"),
//       unit: formData.get("unit"),
//       capacity: formData.get("capacity"),
//       sellPrice: Number.parseFloat(formData.get("sellPrice") as string),
//       costPrice: Number.parseFloat(formData.get("costPrice") as string),
//       discountRate: Number.parseInt(formData.get("discountRate") as string) || 0,
//       desc: formData.get("desc"),
//     }

//     try {
//       const response = await fetch("/api/products", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(productData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         fetchProducts()
//       }
//     } catch (error) {
//       console.error("Error adding product:", error)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
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

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Product
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Add New Product</DialogTitle>
//               <DialogDescription>Create a new product in your inventory</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddProduct} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="productName">Product Name</Label>
//                   <Input id="productName" name="productName" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="productCode">Product Code</Label>
//                   <Input id="productCode" name="productCode" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="categoryId">Category</Label>
//                 <Select name="categoryId" required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((category) => (
//                       <SelectItem key={category.categoryId} value={category.categoryId}>
//                         {category.categoryName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="unit">Unit</Label>
//                   <Input id="unit" name="unit" placeholder="kg, lbs, etc." />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="capacity">Capacity</Label>
//                   <Input id="capacity" name="capacity" placeholder="50kg, 25lbs, etc." />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="costPrice">Cost Price</Label>
//                   <Input id="costPrice" name="costPrice" type="number" step="0.01" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="sellPrice">Sell Price</Label>
//                   <Input id="sellPrice" name="sellPrice" type="number" step="0.01" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="discountRate">Discount %</Label>
//                   <Input id="discountRate" name="discountRate" type="number" min="0" max="100" defaultValue="0" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="desc">Description</Label>
//                 <Textarea id="desc" name="desc" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Add Product</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Package className="h-5 w-5" />
//             Product Inventory
//           </CardTitle>
//           <CardDescription>{filteredProducts.length} products in your catalog</CardDescription>
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

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Unit/Capacity</TableHead>
//                   <TableHead>Cost Price</TableHead>
//                   <TableHead>Sell Price</TableHead>
//                   <TableHead>Stock</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredProducts.map((product) => (
//                   <motion.tr
//                     key={product.productId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div>
//                         <div className="font-medium">{product.productName}</div>
//                         {product.productCode && (
//                           <div className="text-sm text-muted-foreground">{product.productCode}</div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>{product.category.categoryName}</TableCell>
//                     <TableCell>
//                       {product.unit && product.capacity
//                         ? `${product.capacity} ${product.unit}`
//                         : product.unit || product.capacity || "-"}
//                     </TableCell>
//                     <TableCell>{formatCurrency(product.costPrice)}</TableCell>
//                     <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           (product.stocks?.quantity || 0) < 10
//                             ? "destructive"
//                             : (product.stocks?.quantity || 0) < 50
//                               ? "secondary"
//                               : "default"
//                         }
//                       >
//                         {product.stocks?.quantity || 0}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </motion.tr>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
