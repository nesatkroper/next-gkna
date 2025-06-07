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
import { FileUpload } from "@/components/ui/file-upload"
import { Plus, Search, Tag, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBrandStore } from "@/stores/brand-store"
import { uploadFile } from "@/lib/file-upload"
import { Brand } from "@/lib/generated/prisma"
import { useTranslation } from "react-i18next"

export default function BrandsPage() {
  const { t } = useTranslation('common')
  const {
    items: brands,
    isLoading: brandLoading,
    error: brandError,
    fetch: fetchBrands,
    create: createBrand,
    update: updateBrand,
    delete: deleteBrand,
  } = useBrandStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const activeBrands = brands.filter((brand) => brand.status === "active")

  const filteredBrands = activeBrands.filter(
    (brand) =>
      brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.brandCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    {
      key: "brandName",
      label: "Brand",
      type: "image" as const,
    },
    {
      key: "brandCode",
      label: "Code",
      render: (_value: any, row: Brand) => row.brandCode ?? "-",
    },
    {
      key: "memo",
      label: "Memo",
      render: (_value: any, row: Brand) => row.memo ?? "-",
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date" as const,
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
      key: "brandName",
      primary: true,
    },
    {
      key: "brandCode",
      secondary: true,
      render: (_value: any, row: Brand) => row.brandCode ?? "-",
    },
    {
      key: "memo",
      label: "Memo",
      render: (_value: any, row: Brand) => row.memo ?? "-",
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
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      let pictureUrl = editingBrand?.picture || null

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

      const brandData: Partial<Brand> = {
        brandName: formData.get("brandName") as string,
        memo: formData.get("memo") as string || null,
        picture: pictureUrl,
      }

      if (!brandData.brandName) {
        throw new Error("Brand name is required")
      }

      const success = editingBrand
        ? await updateBrand(editingBrand.brandId, brandData)
        : await createBrand(brandData)

      if (success) {
        toast({
          title: "Success",
          description: `Brand ${editingBrand ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setSelectedFile(null)
        setEditingBrand(null)
          ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Brand operation failed")
      }
    } catch (error: any) {
      console.error("Brand submit error:", error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingBrand ? "update" : "create"} brand`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    try {
      const success = await deleteBrand(brandId)
      if (success) {
        toast({
          title: "Success",
          description: "Brand deleted successfully",
        })
      } else {
        throw new Error("Failed to delete brand")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete brand",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchBrands()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Brands')}</h1>
          <p className="text-muted-foreground">{t("Manage your brand catalog")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={brandLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${brandLoading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setSelectedFile(null)
                setEditingBrand(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Brand")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
                <DialogDescription>
                  {editingBrand ? "Update brand details" : "Create a new brand in your catalog"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">{t("Brand Name")} *</Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    required
                    defaultValue={editingBrand?.brandName ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">{t("Memo")}</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    rows={4}
                    defaultValue={editingBrand?.memo ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Brand Image")}</Label>
                  <FileUpload
                    onFileSelect={(file) => setSelectedFile(file)}
                    accept="image/*"
                    maxSize={5}
                    preview={true}
                    value={selectedFile}
                    placeholder="Upload brand image"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingBrand ? "Updating..." : "Creating..."}
                      </>
                    ) : editingBrand ? (
                      "Update Brand"
                    ) : (
                      "Create Brand"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {brandError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{brandError}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={brandLoading}
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
                <Tag className="h-5 w-5" />
                {t("Brand Catalog")}
                {brandLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredBrands.length} active brands</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={brandLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredBrands}
              fields={cardFields}
              loading={brandLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="brandId"
              imageField="picture"
              nameField="brandName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredBrands}
              columns={tableColumns}
              loading={brandLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="brandId"
              imageField="picture"
              nameField="brandName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}