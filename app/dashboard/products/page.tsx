
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Decimal } from "@/lib/generated/prisma"
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
import { useToast } from "@/components/ui/use-toast"
import { unit } from "@/constant"
import { useCategoryStore, useProductStore } from "@/stores"
import { uploadFile } from "@/lib/file-upload"
import { usePermissions } from "@/hooks/use-permissions"

export const dynamic = 'force-dynamic';
export default function ProductsPage() {
  const {
    items: products,
    isLoading: prodLoading,
    error: prodError,
    fetch: prodFetch,
    create: prodCreate,
    update: prodUpdate,
    delete: prodDelete,
  } = useProductStore()

  const {
    items: categories,
    isLoading: cateLoading,
    error: cateError,
    fetch: cateFetch,
  } = useCategoryStore()

  const { toast } = useToast()
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    prodFetch()
    cateFetch()
  }, [prodFetch, cateFetch])

  console.log(canCreate, canUpdate, canDelete)

  const activeCategories = categories.filter((cate) => cate.status === "active")
  const activeProducts = products.filter((prod) => prod.status === "active")

  const filteredProducts = activeProducts.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    {
      key: "productName",
      label: "Product",
      type: "image" as const,
    },
    {
      key: "Category.categoryName",
      label: "Category",
      render: (_value: any, row: any) => row.Category?.categoryName ?? "Unknown",
    },
    {
      key: "unit_capacity",
      label: "Unit/Capacity",
      render: (_value: any, row: any) =>
        row.unit && row.capacity ? `${row.capacity} ${row.unit}` : row.unit || row.capacity || "-",
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
      render: (_value: any, row: any) => row.Stock?.quantity ?? 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
  ]

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
      render: (_value: any, row: any) => row.Category?.categoryName ?? "Unknown",
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
      render: (_value: any, row: any) => row.Stock?.quantity ?? 0,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      let pictureUrl = editingProduct?.picture || null

      // Upload image if selected
      if (selectedFile) {
        try {
          pictureUrl = await uploadFile(selectedFile, { aspectRatio: "original" })
        } catch (uploadError: any) {
          toast({
            title: "Error",
            description: `Failed to upload image: ${uploadError.message}`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      const productData = {
        productName: formData.get("productName") as string,
        categoryId: formData.get("categoryId") as string,
        unit: formData.get("unit") as string || null,
        capacity: new Decimal(formData.get("capacity") as string || "0"),
        sellPrice: new Decimal(formData.get("sellPrice") as string || "0"),
        costPrice: new Decimal(formData.get("costPrice") as string || "0"),
        discountRate: Number.parseInt(formData.get("discountRate") as string) || 0,
        desc: formData.get("desc") as string || null,
        picture: pictureUrl,
      }

      // Validate required fields
      if (!productData.productName) {
        throw new Error("Product name is required")
      }
      if (!productData.categoryId) {
        throw new Error("Category is required")
      }
      if (!productData.sellPrice || productData.sellPrice.lessThan(0)) {
        throw new Error("Sell price must be non-negative")
      }
      if (!productData.costPrice || productData.costPrice.lessThan(0)) {
        throw new Error("Cost price must be non-negative")
      }

      const success = editingProduct
        ? await prodUpdate(editingProduct.productId, productData)
        : await prodCreate(productData)

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
        throw new Error("Product operation failed")
      }
    } catch (error: any) {
      console.error("Product submit error:", error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingProduct ? "update" : "create"} product`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const success = await prodDelete(productId)
      if (success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    prodFetch()
    cateFetch()
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
          <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading ? "animate-spin" : ""}`} />
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
              {canCreate && <Button disabled={activeCategories.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>}
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
                      defaultValue={editingProduct?.productName ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select
                      name="categoryId"
                      required
                      defaultValue={editingProduct?.categoryId ?? ""}
                      disabled={isSaving}
                    >
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.capacity ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      name="unit"
                      defaultValue={editingProduct?.unit ?? ""}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unit.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      defaultValue={editingProduct?.costPrice ?? ""}
                      disabled={isSaving}
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
                      defaultValue={editingProduct?.sellPrice ?? ""}
                      disabled={isSaving}
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
                      defaultValue={editingProduct?.discountRate ?? 0}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <FileUpload
                      onFileSelect={(file) => setSelectedFile(file)}
                      accept="image/*"
                      maxSize={5}
                      preview={true}
                      value={selectedFile}
                      placeholder="Upload product image"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      name="desc"
                      rows={9}
                      defaultValue={editingProduct?.desc ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  {canUpdate && <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? "Updating..." : "Creating..."}
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {(prodError || cateError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{prodError || cateError}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={prodLoading || cateLoading}
              >
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
                {(prodLoading || cateLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
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
                disabled={prodLoading || cateLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredProducts}
              fields={cardFields}
              loading={prodLoading || cateLoading}
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
              loading={prodLoading || cateLoading}
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



// // app/products/page.tsx
// "use client";
// export const dynamic = "force-dynamic";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { FileUpload } from "@/components/ui/file-upload";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useTranslation } from "react-i18next";
// import { useRouter } from "next/navigation";
// import { validateFile } from "@/lib/file-upload";
// import { useProductStore, useCategoryStore, useBrandStore } from "@/stores";
// import { usePermissions } from "@/hooks/use-permissions";
// import { unit } from "@/constant";

// export default function ProductsPage() {
//   const { t } = useTranslation("ui");
//   const {
//     items: products,
//     isLoading: prodLoading,
//     error: prodError,
//     fetch: prodFetch,
//     delete: prodDelete,
//   } = useProductStore();
//   const {
//     items: categories,
//     isLoading: cateLoading,
//     error: cateError,
//     fetch: cateFetch,
//   } = useCategoryStore();
//   const {
//     items: brands,
//     isLoading: brandLoading,
//     fetch: brandFetch,
//   } = useBrandStore();
//   const { canCreate, canUpdate, canDelete } = usePermissions();
//   const { toast } = useToast();
//   const router = useRouter();
//   const [isSaving, setIsSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [view, setView] = useState<"table" | "card">("table");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);

//   useEffect(() => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   }, [prodFetch, cateFetch, brandFetch]);

//   const activeCategories = categories.filter((cate) => cate.status === "active");
//   const activeBrands = brands.filter((brand) => brand.status === "active");
//   const activeProducts = products.filter((prod) => prod.status === "active");

//   const filteredProducts = activeProducts.filter(
//     (product) =>
//       product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const tableColumns = [
//     { key: "productName", label: t("Product"), type: "image" as const },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value: any, row: Product) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     {
//       key: "unit_capacity",
//       label: t("Unit/Capacity"),
//       render: (_value: any, row: Product) =>
//         row.unit && row.capacity ? `${row.capacity} ${row.unit}` : row.unit || row.capacity || "-",
//     },
//     { key: "costPrice", label: t("Cost Price"), type: "currency" as const },
//     { key: "sellPrice", label: t("Sell Price"), type: "currency" as const },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge" as const,
//       render: (_value: any, row: Product) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//     { key: "status", label: t("Status"), type: "badge" as const },
//   ];

//   const cardFields = [
//     { key: "picture", type: "image" as const },
//     { key: "productName", primary: true },
//     { key: "productCode", secondary: true },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value: any, row: Product) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     { key: "costPrice", label: t("Cost"), type: "currency" as const },
//     { key: "sellPrice", label: t("Price"), type: "currency" as const },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge" as const,
//       render: (_value: any, row: Product) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//   ];

//   async function handleSubmit(formData: FormData) {
//     setIsSaving(true);

//     try {
//       const productData: Partial<Product> = {
//         productName: formData.get("productName") as string,
//         productCode: formData.get("productCode") as string | null,
//         unit: formData.get("unit") as string | null,
//         capacity: formData.get("capacity") ? parseFloat(formData.get("capacity") as string) : null,
//         sellPrice: parseFloat(formData.get("sellPrice") as string),
//         costPrice: parseFloat(formData.get("costPrice") as string),
//         discountRate: parseInt(formData.get("discountRate") as string) || 0,
//         desc: formData.get("desc") as string | null,
//         categoryId: formData.get("categoryId") as string,
//         brandId: formData.get("brandId") as string | null,
//         picture: editingProduct?.picture || null,
//       };

//       if (!productData.productName) {
//         throw new Error(t("Product name is required"));
//       }
//       if (!productData.categoryId) {
//         throw new Error(t("Category is required"));
//       }
//       if (productData.sellPrice < 0) {
//         throw new Error(t("Sell price must be non-negative"));
//       }
//       if (productData.costPrice < 0) {
//         throw new Error(t("Cost price must be non-negative"));
//       }

//       if (selectedFile) {
//         const validationError = validateFile(selectedFile, 5);
//         if (validationError) {
//           throw new Error(validationError);
//         }
//       }

//       const { create, update } = useProductStore.getState();
//       const success = editingProduct
//         ? await update(editingProduct.productId, productData, selectedFile)
//         : await create(productData, selectedFile);

//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t(`Product ${editingProduct ? "updated" : "created"} successfully`),
//         });
//         setIsDialogOpen(false);
//         setSelectedFile(null);
//         setEditingProduct(null);
//         router.refresh();
//       } else {
//         throw new Error(t("Product operation failed"));
//       }
//     } catch (error: any) {
//       toast({
//         title: t("Error"),
//         description: error.message || t(`Failed to ${editingProduct ? "update" : "create"} product`),
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const handleEdit = (product: Product) => {
//     if (!canUpdate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to edit products"),
//         variant: "destructive",
//       });
//       return;
//     }
//     setEditingProduct(product);
//     setSelectedFile(null);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (productId: string) => {
//     if (!canDelete) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to delete products"),
//         variant: "destructive",
//       });
//       return;
//     }
//     if (!confirm(t("Are you sure you want to delete this product?"))) return;

//     try {
//       const success = await prodDelete(productId);
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Product deleted successfully"),
//         });
//       } else {
//         throw new Error(t("Failed to delete product"));
//       }
//     } catch (error: any) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to delete product"),
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRetry = () => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Products")}</h1>
//           <p className="text-muted-foreground">{t("Manage your fertilizer inventory and product catalog")}</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading || brandLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setSelectedFile(null);
//                 setEditingProduct(null);
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               {canCreate && (
//                 <Button disabled={activeCategories.length === 0}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   {t("Add Product")}
//                 </Button>
//               )}
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? t("Edit Product") : t("Add New Product")}</DialogTitle>
//                 <DialogDescription>
//                   {editingProduct ? t("Update product information") : t("Create a new product in your inventory")}
//                 </DialogDescription>
//               </DialogHeader>
//               <form action={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="productName">{t("Product Name")} *</Label>
//                     <Input
//                       id="productName"
//                       name="productName"
//                       required
//                       defaultValue={editingProduct?.productName ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="categoryId">{t("Category")} *</Label>
//                     <Select
//                       name="categoryId"
//                       required
//                       defaultValue={editingProduct?.categoryId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select category")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {activeCategories.length > 0 ? (
//                           activeCategories.map((category) => (
//                             <SelectItem key={category.categoryId} value={category.categoryId}>
//                               {category.categoryName}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-categories" disabled>
//                             {t("No categories available")}
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="brandId">{t("Brand")}</Label>
//                     <Select
//                       name="brandId"
//                       defaultValue={editingProduct?.brandId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select brand")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="">{t("No brand")}</SelectItem>
//                         {activeBrands.map((brand) => (
//                           <SelectItem key={brand.brandId} value={brand.brandId}>
//                             {brand.brandName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="productCode">{t("Product Code")}</Label>
//                     <Input
//                       id="productCode"
//                       name="productCode"
//                       defaultValue={editingProduct?.productCode ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="capacity">{t("Capacity")}</Label>
//                     <Input
//                       id="capacity"
//                       name="capacity"
//                       type="number"
//                       step="0.01"
//                       defaultValue={editingProduct?.capacity ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="unit">{t("Unit")}</Label>
//                     <Select
//                       name="unit"
//                       defaultValue={editingProduct?.unit ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select unit")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {unit.map((u) => (
//                           <SelectItem key={u.value} value={u.value}>
//                             {u.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="costPrice">{t("Cost Price")} *</Label>
//                     <Input
//                       id="costPrice"
//                       name="costPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.costPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="sellPrice">{t("Sell Price")} *</Label>
//                     <Input
//                       id="sellPrice"
//                       name="sellPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.sellPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="discountRate">{t("Discount %")}</Label>
//                     <Input
//                       id="discountRate"
//                       name="discountRate"
//                       type="number"
//                       min="0"
//                       max="100"
//                       defaultValue={editingProduct?.discountRate ?? 0}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>{t("Product Image")}</Label>
//                     <FileUpload
//                       onFileSelect={(file) => setSelectedFile(file)}
//                       accept="image/*"
//                       maxSize={5}
//                       preview={true}
//                       value={selectedFile}
//                       placeholder={t("Upload product image")}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="desc">{t("Description")}</Label>
//                     <Textarea
//                       id="desc"
//                       name="desc"
//                       rows={9}
//                       defaultValue={editingProduct?.desc ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                     disabled={isSaving}
//                   >
//                     {t("Cancel")}
//                   </Button>
//                   {(canCreate || canUpdate) && (
//                     <Button type="submit" disabled={isSaving}>
//                       {isSaving ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           {editingProduct ? t("Updating...") : t("Creating...")}
//                         </>
//                       ) : editingProduct ? (
//                         t("Update Product")
//                       ) : (
//                         t("Create Product")
//                       )}
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {(prodError || cateError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{prodError || cateError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
//                 {t("Try Again")}
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
//                 {t("Product Inventory")}
//                 {(prodLoading || cateLoading || brandLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>
//                 {filteredProducts.length} {t("products in your catalog")}
//               </CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
//               />
//               <Input
//                 placeholder={t("Search products...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={prodLoading || cateLoading || brandLoading}
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredProducts}
//               fields={cardFields}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//               columns={4}
//             />
//           ) : (
//             <DataTable
//               data={filteredProducts}
//               columns={tableColumns}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// interface Product {
//   productId: string;
//   productName: string;
//   productCode?: string | null;
//   picture?: string | null;
//   unit?: string | null;
//   capacity?: number | null;
//   sellPrice: number;
//   costPrice: number;
//   discountRate: number;
//   desc?: string | null;
//   status: "active" | "inactive";
//   createdAt: string;
//   updatedAt: string;
//   categoryId: string;
//   brandId?: string | null;
//   Category?: { categoryName: string };
//   Brand?: { brandName: string };
//   Stock?: { quantity: number }[];
// }



// // app/products/page.tsx
// "use client";
// export const dynamic = "force-dynamic";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { FileUpload } from "@/components/ui/file-upload";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useTranslation } from "react-i18next";
// import { useRouter } from "next/navigation";
// import { validateFile } from "@/lib/file-upload";
// import { useProductStore, useCategoryStore, useBrandStore } from "@/stores";
// import { usePermissions } from "@/hooks/use-permissions";
// import { unit } from "@/constant";

// export default function ProductsPage() {
//   const { t } = useTranslation("ui");
//   const {
//     items: products,
//     isLoading: prodLoading,
//     error: prodError,
//     fetch: prodFetch,
//     delete: prodDelete,
//   } = useProductStore();
//   const {
//     items: categories,
//     isLoading: cateLoading,
//     error: cateError,
//     fetch: cateFetch,
//   } = useCategoryStore();
//   const {
//     items: brands,
//     isLoading: brandLoading,
//     fetch: brandFetch,
//   } = useBrandStore();
//   const { canCreate, canUpdate, canDelete } = usePermissions();
//   const { toast } = useToast();
//   const router = useRouter();
//   const [isSaving, setIsSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [view, setView] = useState<"table" | "card">("table");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);

//   useEffect(() => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   }, [prodFetch, cateFetch, brandFetch]);

//   const activeCategories = categories.filter((cate) => cate.status === "active");
//   const activeBrands = brands.filter((brand) => brand.status === "active");
//   const activeProducts = products.filter((prod) => prod.status === "active");

//   const filteredProducts = activeProducts.filter(
//     (product) =>
//       product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const tableColumns = [
//     { key: "productName", label: t("Product"), type: "image" as const },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value: any, row: Product) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     {
//       key: "unit_capacity",
//       label: t("Unit/Capacity"),
//       render: (_value: any, row: Product) =>
//         row.unit && row.capacity != null ? `${row.capacity} ${row.unit}` : row.unit || row.capacity || "-",
//     },
//     { key: "costPrice", label: t("Cost Price"), type: "currency" as const },
//     { key: "sellPrice", label: t("Sell Price"), type: "currency" as const },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge" as const,
//       render: (_value: any, row: Product) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//     { key: "status", label: t("Status"), type: "badge" as const },
//   ];

//   const cardFields = [
//     { key: "picture", type: "image" as const },
//     { key: "productName", primary: true },
//     { key: "productCode", secondary: true },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value: any, row: Product) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     { key: "costPrice", label: t("Cost"), type: "currency" as const },
//     { key: "sellPrice", label: t("Price"), type: "currency" as const },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge" as const,
//       render: (_value: any, row: Product) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//   ];

//   async function handleSubmit(formData: FormData) {
//     setIsSaving(true);

//     try {
//       const productData: Partial<Product> = {
//         productName: formData.get("productName") as string,
//         productCode: formData.get("productCode") as string | null,
//         unit: formData.get("unit") as string | null,
//         capacity: formData.get("capacity") ? formData.get("capacity") as string : null,
//         sellPrice: formData.get("sellPrice") as string,
//         costPrice: formData.get("costPrice") as string,
//         discountRate: parseInt(formData.get("discountRate") as string) || 0,
//         desc: formData.get("desc") as string | null,
//         categoryId: formData.get("categoryId") as string,
//         brandId: formData.get("brandId") as string | null,
//         picture: editingProduct?.picture || null,
//       };

//       if (!productData.productName) {
//         throw new Error(t("Product name is required"));
//       }
//       if (!productData.categoryId) {
//         throw new Error(t("Category is required"));
//       }
//       if (parseFloat(productData.sellPrice) < 0) {
//         throw new Error(t("Sell price must be non-negative"));
//       }
//       if (parseFloat(productData.costPrice) < 0) {
//         throw new Error(t("Cost price must be non-negative"));
//       }

//       if (selectedFile) {
//         const validationError = validateFile(selectedFile, 5);
//         if (validationError) {
//           throw new Error(validationError);
//         }
//       }

//       const { create, update } = useProductStore.getState();
//       const success = editingProduct
//         ? await update(editingProduct.productId, productData, selectedFile)
//         : await create(productData, selectedFile);

//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t(`Product ${editingProduct ? "updated" : "created"} successfully`),
//         });
//         setIsDialogOpen(false);
//         setSelectedFile(null);
//         setEditingProduct(null);
//         router.refresh();
//       } else {
//         throw new Error(t("Product operation failed"));
//       }
//     } catch (error: any) {
//       toast({
//         title: t("Error"),
//         description: error.message || t(`Failed to ${editingProduct ? "update" : "create"} product`),
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const handleEdit = (product: Product) => {
//     if (!canUpdate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to edit products"),
//         variant: "destructive",
//       });
//       return;
//     }
//     setEditingProduct(product);
//     setSelectedFile(null);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (productId: string) => {
//     if (!canDelete) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to delete products"),
//         variant: "destructive",
//       });
//       return;
//     }
//     if (!confirm(t("Are you sure you want to delete this product?"))) return;

//     try {
//       const success = await prodDelete(productId);
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Product deleted successfully"),
//         });
//       } else {
//         throw new Error(t("Failed to delete product"));
//       }
//     } catch (error: any) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to delete product"),
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRetry = () => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Products")}</h1>
//           <p className="text-muted-foreground">{t("Manage your fertilizer inventory and product catalog")}</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading || brandLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setSelectedFile(null);
//                 setEditingProduct(null);
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               {canCreate && (
//                 <Button disabled={activeCategories.length === 0}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   {t("Add Product")}
//                 </Button>
//               )}
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? t("Edit Product") : t("Add New Product")}</DialogTitle>
//                 <DialogDescription>
//                   {editingProduct ? t("Update product information") : t("Create a new product in your inventory")}
//                 </DialogDescription>
//               </DialogHeader>
//               <form action={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="productName">{t("Product Name")} *</Label>
//                     <Input
//                       id="productName"
//                       name="productName"
//                       required
//                       defaultValue={editingProduct?.productName ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="categoryId">{t("Category")} *</Label>
//                     <Select
//                       name="categoryId"
//                       required
//                       defaultValue={editingProduct?.categoryId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select category")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {activeCategories.length > 0 ? (
//                           activeCategories.map((category) => (
//                             <SelectItem key={category.categoryId} value={category.categoryId}>
//                               {category.categoryName}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-categories" disabled>
//                             {t("No categories available")}
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="brandId">{t("Brand")}</Label>
//                     <Select
//                       name="brandId"
//                       defaultValue={editingProduct?.brandId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select brand")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="">{t("No brand")}</SelectItem>
//                         {activeBrands.map((brand) => (
//                           <SelectItem key={brand.brandId} value={brand.brandId}>
//                             {brand.brandName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="productCode">{t("Product Code")}</Label>
//                     <Input
//                       id="productCode"
//                       name="productCode"
//                       defaultValue={editingProduct?.productCode ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="capacity">{t("Capacity")}</Label>
//                     <Input
//                       id="capacity"
//                       name="capacity"
//                       type="number"
//                       step="0.01"
//                       defaultValue={editingProduct?.capacity ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="unit">{t("Unit")}</Label>
//                     <Select
//                       name="unit"
//                       defaultValue={editingProduct?.unit ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select unit")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {unit.map((u) => (
//                           <SelectItem key={u.value} value={u.value}>
//                             {u.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="costPrice">{t("Cost Price")} *</Label>
//                     <Input
//                       id="costPrice"
//                       name="costPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.costPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="sellPrice">{t("Sell Price")} *</Label>
//                     <Input
//                       id="sellPrice"
//                       name="sellPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.sellPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="discountRate">{t("Discount %")}</Label>
//                     <Input
//                       id="discountRate"
//                       name="discountRate"
//                       type="number"
//                       min="0"
//                       max="100"
//                       defaultValue={editingProduct?.discountRate ?? 0}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>{t("Product Image")}</Label>
//                     <FileUpload
//                       onFileSelect={(file) => setSelectedFile(file)}
//                       accept="image/*"
//                       maxSize={5}
//                       preview={true}
//                       value={selectedFile}
//                       placeholder={t("Upload product image")}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="desc">{t("Description")}</Label>
//                     <Textarea
//                       id="desc"
//                       name="desc"
//                       rows={9}
//                       defaultValue={editingProduct?.desc ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                     disabled={isSaving}
//                   >
//                     {t("Cancel")}
//                   </Button>
//                   {(canCreate || canUpdate) && (
//                     <Button type="submit" disabled={isSaving}>
//                       {isSaving ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           {editingProduct ? t("Updating...") : t("Creating...")}
//                         </>
//                       ) : editingProduct ? (
//                         t("Update Product")
//                       ) : (
//                         t("Create Product")
//                       )}
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {(prodError || cateError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{prodError || cateError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
//                 {t("Try Again")}
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
//                 {t("Product Inventory")}
//                 {(prodLoading || cateLoading || brandLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>
//                 {filteredProducts.length} {t("products in your catalog")}
//               </CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
//               />
//               <Input
//                 placeholder={t("Search products...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={prodLoading || cateLoading || brandLoading}
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredProducts}
//               fields={cardFields}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//               columns={4}
//             />
//           ) : (
//             <DataTable
//               data={filteredProducts}
//               columns={tableColumns}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// interface Product {
//   productId: string;
//   productName: string;
//   productCode?: string | null;
//   picture?: string | null;
//   unit?: string | null;
//   capacity?: number | null;
//   sellPrice: number;
//   costPrice: number;
//   discountRate: number;
//   desc?: string | null;
//   status: "active" | "inactive";
//   createdAt: string;
//   updatedAt: string;
//   categoryId: string;
//   brandId?: string | null;
//   Category?: { categoryName: string };
//   Brand?: { brandName: string };
//   Stock?: { quantity: number }[];
// }



