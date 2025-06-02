"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Search, Building, Edit, Trash2, Eye, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Department {
  departmentId: string
  departmentName: string
  departmentCode: string
  memo: string | null
  status: string
  createdAt: string
  _count: {
    employees: number
    positions: number
  }
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const data = await response.json()
      const departments = Array.isArray(data) ? data : data?.departments || []
      setDepartments(departments)
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDepartments = Array.isArray(departments)
    ? departments.filter(
        (department) =>
          department.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const departmentData = {
      departmentName: formData.get("departmentName"),
      departmentCode: formData.get("departmentCode"),
      memo: formData.get("memo"),
    }

    try {
      const url = editingDepartment ? `/api/departments/${editingDepartment.departmentId}` : "/api/departments"
      const method = editingDepartment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(departmentData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingDepartment(null)
        fetchDepartments()
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error("Error saving department:", error)
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setIsDialogOpen(true)
  }

  const handleDelete = async (departmentId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchDepartments()
      }
    } catch (error) {
      console.error("Error deleting department:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage organizational departments and structure</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingDepartment(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? "Update department information" : "Create a new department"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    name="departmentName"
                    required
                    defaultValue={editingDepartment?.departmentName || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentCode">Department Code</Label>
                  <Input
                    id="departmentCode"
                    name="departmentCode"
                    defaultValue={editingDepartment?.departmentCode || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">Description</Label>
                <Textarea id="memo" name="memo" rows={3} defaultValue={editingDepartment?.memo || ""} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingDepartment ? "Update" : "Create"} Department</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Departments
          </CardTitle>
          <CardDescription>{filteredDepartments.length} departments in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <motion.tr
                    key={department.departmentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="font-medium">{department.departmentName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{department.departmentCode || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <Badge variant="secondary">{department._count.employees}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{department._count.positions}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate text-sm">{department.memo || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.status === "active" ? "default" : "secondary"}>
                        {department.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(department.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(department.departmentId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
