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
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, FolderOpen, Loader2, RefreshCw } from "lucide-react"
import { useAppStore } from "@/lib/store/use-app-store"
import { useToast } from "@/components/ui/use-toast"

export default function CategoriesPage() {
  const {
    categories,
    isLoadingCategories,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    clearErrors,
  } = useAppStore()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories) {
      fetchCategories()
    }
  }, [])

  const activeCategories = getActiveCategories()
  const filteredCategories = activeCategories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "categoryName",
      label: "Category Name",
    },
    {
      key: "categoryCode",
      label: "Category Code",
    },
    {
      key: "desc",
      label: "Description",
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date" as const,
    },
  ]

  // Card fields configuration
  const cardFields = [
    {
      key: "categoryName",
      primary: true,
    },
    {
      key: "categoryCode",
      secondary: true,
    },
    {
      key: "desc",
      label: "Description",
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date" as const,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const categoryData = {
      categoryName: formData.get("categoryName") as string,
      categoryCode: formData.get("categoryCode") as string,
      desc: formData.get("desc") as string,
    }

    const success = editingCategory
      ? await updateCategory(editingCategory.categoryId, categoryData)
      : await createCategory(categoryData)

    if (success) {
      toast({
        title: "Success",
        description: `Category ${editingCategory ? "updated" : "created"} successfully`,
      })
      setIsDialogOpen(false)
      setEditingCategory(null)
        ; (e.target as HTMLFormElement).reset()
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editingCategory ? "update" : "create"} category`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const success = await deleteCategory(categoryId)
    if (success) {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    clearErrors()
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
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products with categories</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoadingCategories}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingCategories ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingCategory(null)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update category information" : "Create a new category for your products"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    name="categoryName"
                    required
                    defaultValue={editingCategory?.categoryName || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryCode">Category Code (Auto-generated)</Label>
                  <Input
                    id="categoryCode"
                    name="categoryCode"
                    placeholder="Leave empty to auto-generate"
                    defaultValue={editingCategory?.categoryCode || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" name="desc" rows={3} defaultValue={editingCategory?.desc || ""} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingCategory || isUpdatingCategory}>
                    {isCreatingCategory || isUpdatingCategory ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCategory ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {categoriesError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{categoriesError}</p>
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
                <FolderOpen className="h-5 w-5" />
                Categories
                {isLoadingCategories && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredCategories.length} categories available</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredCategories}
              fields={cardFields}
              loading={isLoadingCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="categoryId"
              nameField="categoryName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredCategories}
              columns={tableColumns}
              loading={isLoadingCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="categoryId"
              nameField="categoryName"
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
// import { FileUpload } from "@/components/ui/file-upload"
// import { Plus, Search, Package, Edit, Trash2, Eye } from "lucide-react"
// import { formatDate } from "@/lib/utils"
// import { uploadFile } from "@/lib/file-upload"

// interface Category {
//   categoryId: string
//   categoryName: string
//   categoryCode: string
//   picture: string | null
//   memo: string | null
//   status: string
//   createdAt: string
//   _count: {
//     products: number
//   }
// }

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [uploading, setUploading] = useState(false)

//   useEffect(() => {
//     fetchCategories()
//   }, [])

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch("/api/categories")
//       const data = await response.json()
//       setCategories(Array.isArray(data) ? data : data.categories || [])
//     } catch (error) {
//       console.error("Error fetching categories:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredCategories = categories.filter(
//     (category) =>
//       category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       category.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setUploading(true)

//     try {
//       const formData = new FormData(e.currentTarget)
//       let pictureUrl = editingCategory?.picture || ""

//       // Upload file if selected
//       if (selectedFile) {
//         pictureUrl = await uploadFile(selectedFile)
//       }

//       const categoryData = {
//         categoryName: formData.get("categoryName"),
//         categoryCode: formData.get("categoryCode"),
//         picture: pictureUrl,
//         memo: formData.get("memo"),
//       }

//       const url = editingCategory ? `/api/categories/${editingCategory.categoryId}` : "/api/categories"
//       const method = editingCategory ? "PUT" : "POST"

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(categoryData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         setEditingCategory(null)
//         setSelectedFile(null)
//         fetchCategories()
//           ; (e.target as HTMLFormElement).reset()
//       }
//     } catch (error) {
//       console.error("Error saving category:", error)
//       alert("Error saving category. Please try again.")
//     } finally {
//       setUploading(false)
//     }
//   }

//   const handleEdit = (category: Category) => {
//     setEditingCategory(category)
//     setSelectedFile(null)
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (categoryId: string) => {
//     if (!confirm("Are you sure you want to delete this category?")) return

//     try {
//       const response = await fetch(`/api/categories/${categoryId}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         fetchCategories()
//       }
//     } catch (error) {
//       console.error("Error deleting category:", error)
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
//           <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
//           <p className="text-muted-foreground">Manage product categories and classifications</p>
//         </div>

//         <Dialog
//           open={isDialogOpen}
//           onOpenChange={(open) => {
//             setIsDialogOpen(open)
//             if (!open) {
//               setEditingCategory(null)
//               setSelectedFile(null)
//             }
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Category
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
//               <DialogDescription>
//                 {editingCategory ? "Update category information" : "Create a new product category"}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="categoryName">Category Name</Label>
//                   <Input
//                     id="categoryName"
//                     name="categoryName"
//                     required
//                     defaultValue={editingCategory?.categoryName || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="categoryCode">Category Code</Label>
//                   <Input id="categoryCode" name="categoryCode" defaultValue={editingCategory?.categoryCode || ""} />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Category Image</Label>
//                 <FileUpload
//                   onFileSelect={setSelectedFile}
//                   accept="image/*"
//                   maxSize={5}
//                   preview={true}
//                   value={selectedFile || editingCategory?.picture}
//                   placeholder="Upload category image"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="memo">Description</Label>
//                 <Textarea id="memo" name="memo" rows={3} defaultValue={editingCategory?.memo || ""} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={uploading}>
//                   {uploading ? "Saving..." : editingCategory ? "Update" : "Create"} Category
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Package className="h-5 w-5" />
//             Product Categories
//           </CardTitle>
//           <CardDescription>{filteredCategories.length} categories in your system</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search categories..."
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
//                   <TableHead>Category</TableHead>
//                   <TableHead>Code</TableHead>
//                   <TableHead>Products</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredCategories.map((category) => (
//                   <motion.tr
//                     key={category.categoryId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         {category.picture && (
//                           <img
//                             src={category.picture || "/placeholder.svg"}
//                             alt={category.categoryName}
//                             className="w-8 h-8 rounded object-cover"
//                           />
//                         )}
//                         <div className="font-medium">{category.categoryName}</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="text-sm text-muted-foreground">{category.categoryCode || "-"}</div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="secondary">{category._count.products}</Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="max-w-48 truncate text-sm">{category.memo || "-"}</div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={category.status === "active" ? "default" : "secondary"}>{category.status}</Badge>
//                     </TableCell>
//                     <TableCell>{formatDate(category.createdAt)}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm" onClick={() => handleDelete(category.categoryId)}>
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
