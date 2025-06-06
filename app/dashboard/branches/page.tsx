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
import { Plus, Search, Building2, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBranchStore } from "@/stores/branch-store"
import { uploadFile } from "@/lib/file-upload"
import { Branch } from "@/lib/generated/prisma"

export default function BranchesPage() {
  const {
    items: branches,
    isLoading: branchLoading,
    error: branchError,
    fetch: fetchBranches,
    create: createBranch,
    update: updateBranch,
    delete: deleteBranch,
  } = useBranchStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const activeBranches = branches.filter((branch) => branch.status === "active")

  const filteredBranches = activeBranches.filter(
    (branch) =>
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    {
      key: "branchName",
      label: "Branch",
      type: "image" as const,
    },
    {
      key: "branchCode",
      label: "Code",
      render: (_value: any, row: Branch) => row.branchCode ?? "-",
    },
    {
      key: "tel",
      label: "Phone",
      render: (_value: any, row: Branch) => row.tel ?? "-",
    },
    {
      key: "memo",
      label: "Memo",
      render: (_value: any, row: Branch) => row.memo ?? "-",
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
      key: "branchName",
      primary: true,
    },
    {
      key: "branchCode",
      secondary: true,
      render: (_value: any, row: Branch) => row.branchCode ?? "-",
    },
    {
      key: "tel",
      label: "Phone",
      render: (_value: any, row: Branch) => row.tel ?? "-",
    },
    {
      key: "memo",
      label: "Memo",
      render: (_value: any, row: Branch) => row.memo ?? "-",
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
      let pictureUrl = editingBranch?.picture || null

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

      const branchData: Partial<Branch> = {
        branchName: formData.get("branchName") as string,
        branchCode: formData.get("branchCode") as string || null,
        tel: formData.get("tel") as string || null,
        memo: formData.get("memo") as string || null,
        picture: pictureUrl,
      }

      if (!branchData.branchName) {
        throw new Error("Branch name is required")
      }

      const success = editingBranch
        ? await updateBranch(editingBranch.branchId, branchData)
        : await createBranch(branchData)

      if (success) {
        toast({
          title: "Success",
          description: `Branch ${editingBranch ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setSelectedFile(null)
        setEditingBranch(null)
          ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Branch operation failed")
      }
    } catch (error: any) {
      console.error("Branch submit error:", error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingBranch ? "update" : "create"} branch`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      const success = await deleteBranch(branchId)
      if (success) {
        toast({
          title: "Success",
          description: "Branch deleted successfully",
        })
      } else {
        throw new Error("Failed to delete branch")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchBranches()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage your branch network</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={branchLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${branchLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setSelectedFile(null)
                setEditingBranch(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
                <DialogDescription>
                  {editingBranch ? "Update branch details" : "Create a new branch in your network"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name *</Label>
                  <Input
                    id="branchName"
                    name="branchName"
                    required
                    defaultValue={editingBranch?.branchName ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel">Phone Number</Label>
                  <Input
                    id="tel"
                    name="tel"
                    type="tel"
                    defaultValue={editingBranch?.tel ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    rows={4}
                    defaultValue={editingBranch?.memo ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch Image</Label>
                  <FileUpload
                    onFileSelect={(file) => setSelectedFile(file)}
                    accept="image/*"
                    maxSize={5}
                    preview={true}
                    value={selectedFile}
                    placeholder="Upload branch image"
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingBranch ? "Updating..." : "Creating..."}
                      </>
                    ) : editingBranch ? (
                      "Update Branch"
                    ) : (
                      "Create Branch"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {branchError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{branchError}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={branchLoading}
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
                <Building2 className="h-5 w-5" />
                Branch Network
                {branchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredBranches.length} active branches</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={branchLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredBranches}
              fields={cardFields}
              loading={branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="branchId"
              imageField="picture"
              nameField="branchName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredBranches}
              columns={tableColumns}
              loading={branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="branchId"
              imageField="picture"
              nameField="branchName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}