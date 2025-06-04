
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
import { DatePicker } from "@/components/ui/date-picker"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, UserCheck, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useEmployeeStore } from "@/stores/employee-store"
import { useDepartmentStore } from "@/stores/department-store"
import { usePositionStore } from "@/stores/position-store"

export default function EmployeesPage() {
  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
    create,
    update,
    delete: deleteEmployee,
  } = useEmployeeStore()

  const {
    items: departments,
    isLoading: deptLoading,
    error: deptError,
    fetch: fetchDepartments,
  } = useDepartmentStore()

  const {
    items: positions,
    isLoading: posLoading,
    error: posError,
    fetch: fetchPositions,
  } = usePositionStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<"table" | "card">("table")
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [dobDate, setDobDate] = useState<Date | undefined>()
  const [hiredDate, setHiredDate] = useState<Date | undefined>()

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
  }, [fetchEmployees, fetchDepartments, fetchPositions])

  const activeEmployees = employees.filter((emp) => emp.status === "active")

  const filteredEmployees = activeEmployees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPositions = positions.filter((position) =>
    selectedDepartment ? position.departmentId === selectedDepartment : true,
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Employee",
      render: (_value: any, row: any) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          {row.employeeCode && (
            <div className="text-sm text-muted-foreground">{row.employeeCode}</div>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (_value: any, row: any) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {row.phone}
            </div>
          )}
          {row.EmployeeInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.EmployeeInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Department.departmentName",
      label: "Department",
      render: (_value: any, row: any) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: "Position",
      render: (_value: any, row: any) => row.Position?.positionName || "-",
    },
    {
      key: "salary",
      label: "Salary",
      render: (value: any) => formatCurrency(value),
    },
    {
      key: "performance",
      label: "Performance",
      render: (_value: any, row: any) => (
        <div className="space-y-1">
          <div className="text-sm">Sales: {row._count?.Sale || 0}</div>
          <div className="text-sm text-muted-foreground">Attendance: {row._count?.Attendance || 0}</div>
        </div>
      ),
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
      key: "name",
      primary: true,
      render: (_value: any, row: any) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "employeeCode",
      label: "Employee Code",
      secondary: true,
      render: (value: any) => value || "-",
    },
    {
      key: "contact",
      label: "Contact Info",
      render: (_value: any, row: any) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4" />
              {row.phone}
            </div>
          )}
          {row.EmployeeInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.EmployeeInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Department.departmentName",
      label: "Department",
      render: (_value: any, row: any) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: "Position",
      render: (_value: any, row: any) => row.Position?.positionName || "-",
    },
    {
      key: "salary",
      label: "Salary",
      render: (value: any) => formatCurrency(value),
    },
    {
      key: "performance",
      label: "Performance",
      render: (_value: any, row: any) => (
        <div className="space-y-1">
          <div className="text-sm">Sales: {row._count?.Sale || 0}</div>
          <div className="text-sm text-muted-foreground">Attendance: {row._count?.Attendance || 0}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const employeeData = {
      employeeCode: formData.get("employeeCode") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      gender: formData.get("gender") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      departmentId: formData.get("departmentId") as string,
      positionId: formData.get("positionId") as string,
      salary: Number.parseFloat(formData.get("salary") as string),
      dob: dobDate?.toISOString(),
      hiredDate: hiredDate?.toISOString(),
      region: formData.get("region") as string,
      note: formData.get("note") as string,
    }

    setIsSaving(true)
    try {
      const success = editingEmployee
        ? await update(editingEmployee.employeeId, employeeData)
        : await create(employeeData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Employee ${editingEmployee ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingEmployee(null)
        setDobDate(undefined)
        setHiredDate(undefined)
        setSelectedDepartment("")
          ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Employee operation failed")
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingEmployee ? "update" : "create"} employee`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setDobDate(employee.dob ? new Date(employee.dob) : undefined)
    setHiredDate(employee.hiredDate ? new Date(employee.hiredDate) : undefined)
    setSelectedDepartment(employee.departmentId || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    const success = await deleteEmployee(employeeId)
    if (success) {
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your workforce and employee information</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={empLoading || deptLoading || posLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${empLoading || deptLoading || posLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingEmployee(null)
                setDobDate(undefined)
                setHiredDate(undefined)
                setSelectedDepartment("")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={departments.length === 0 || positions.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Update employee details" : "Create a new employee record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeCode">Employee Code</Label>
                    <Input
                      id="employeeCode"
                      name="employeeCode"
                      defaultValue={editingEmployee?.employeeCode || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      defaultValue={editingEmployee?.gender || "male"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      defaultValue={editingEmployee?.firstName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      defaultValue={editingEmployee?.lastName || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <DatePicker
                      date={dobDate}
                      onDateChange={setDobDate}
                      placeholder="Select date of birth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hired Date</Label>
                    <DatePicker
                      date={hiredDate}
                      onDateChange={setHiredDate}
                      placeholder="Select hired date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={editingEmployee?.phone || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingEmployee?.EmployeeInfo?.email || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select
                      name="departmentId"
                      required
                      onValueChange={(value) => setSelectedDepartment(value)}
                      defaultValue={editingEmployee?.departmentId || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.departmentId} value={dept.departmentId}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positionId">Position *</Label>
                    <Select
                      name="positionId"
                      required
                      defaultValue={editingEmployee?.positionId || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPositions.map((pos) => (
                          <SelectItem key={pos.positionId} value={pos.positionId}>
                            {pos.positionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary *</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingEmployee?.salary || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      name="region"
                      defaultValue={editingEmployee?.region || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notes</Label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    defaultValue={editingEmployee?.note || ""}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingEmployee ? "Updating..." : "Creating..."}
                      </>
                    ) : editingEmployee ? (
                      "Update Employee"
                    ) : (
                      "Create Employee"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(empError || deptError || posError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{empError || deptError || posError}</p>
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
                <UserCheck className="h-5 w-5" />
                Employee Directory
                {(empLoading || deptLoading || posLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredEmployees.length} employees in your organization</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredEmployees}
              fields={cardFields}
              loading={empLoading || deptLoading || posLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="employeeId"
              nameField="firstName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredEmployees}
              columns={tableColumns}
              loading={empLoading || deptLoading || posLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="employeeId"
              nameField="firstName"
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
// import { DatePicker } from "@/components/ui/date-picker"
// import { Plus, Search, UserCheck, Edit, Trash2, Eye, Phone, Mail } from "lucide-react"
// import { formatCurrency } from "@/lib/utils"
// import { useAppStore } from "@/lib/store/use-app-store"



// export default function EmployeesPage() {
//   const {

//     employees,
//     departments,
//     positions,
//     fetchEmployees,
//     fetchDepartments,
//     fetchPositions,
//     isLoadingEmployees,
//     isLoadingDepartments,
//     isLoadingPositions

//   } = useAppStore();

//   useEffect(() => {
//     if (employees.length === 0 && !isLoadingEmployees)
//       fetchEmployees();
//     if (departments.length === 0 && !isLoadingDepartments)
//       fetchDepartments();
//     if (positions.length === 0 && !isLoadingPositions)
//       fetchPositions();
//   }, [])


//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [selectedDepartment, setSelectedDepartment] = useState("")
//   const [dobDate, setDobDate] = useState<Date | undefined>()
//   const [hiredDate, setHiredDate] = useState<Date | undefined>()


//   const filteredEmployees = employees.filter(
//     (employee) =>
//       employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const filteredPositions = positions.filter((position) =>
//     selectedDepartment ? position.departmentId === selectedDepartment : true,
//   )

//   const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)

//     const employeeData = {
//       employeeCode: formData.get("employeeCode"),
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       gender: formData.get("gender"),
//       phone: formData.get("phone"),
//       email: formData.get("email"),
//       departmentId: formData.get("departmentId"),
//       positionId: formData.get("positionId"),
//       salary: Number.parseFloat(formData.get("salary") as string),
//       dob: dobDate?.toISOString(),
//       hiredDate: hiredDate?.toISOString(),
//       region: formData.get("region"),
//       note: formData.get("note"),
//     }

//     try {
//       const response = await fetch("/api/employees", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(employeeData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         setDobDate(undefined)
//         setHiredDate(undefined)
//         setSelectedDepartment("")
//         fetchEmployees()
//           ; (e.target as HTMLFormElement).reset()
//       }
//     } catch (error) {
//       console.error("Error adding employee:", error)
//     }
//   }

//   if (isLoadingEmployees) {
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
//           <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
//           <p className="text-muted-foreground">Manage your workforce and employee information</p>
//         </div>

//         <Dialog
//           open={isDialogOpen}
//           onOpenChange={(open) => {
//             setIsDialogOpen(open)
//             if (!open) {
//               setDobDate(undefined)
//               setHiredDate(undefined)
//               setSelectedDepartment("")
//             }
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Employee
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Add New Employee</DialogTitle>
//               <DialogDescription>Create a new employee record</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddEmployee} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="employeeCode">Employee Code</Label>
//                   <Input id="employeeCode" name="employeeCode" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="gender">Gender</Label>
//                   <Select name="gender" defaultValue="male">
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="male">Male</SelectItem>
//                       <SelectItem value="female">Female</SelectItem>
//                       <SelectItem value="others">Others</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input id="firstName" name="firstName" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input id="lastName" name="lastName" required />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Date of Birth</Label>
//                   <DatePicker date={dobDate} onDateChange={setDobDate} placeholder="Select date of birth" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Hired Date</Label>
//                   <DatePicker date={hiredDate} onDateChange={setHiredDate} placeholder="Select hired date" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone</Label>
//                   <Input id="phone" name="phone" type="tel" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input id="email" name="email" type="email" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="departmentId">Department</Label>
//                   <Select name="departmentId" required onValueChange={(value) => setSelectedDepartment(value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select department" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {departments.map((dept) => (
//                         <SelectItem key={dept.departmentId} value={dept.departmentId}>
//                           {dept.departmentName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="positionId">Position</Label>
//                   <Select name="positionId" required>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select position" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {filteredPositions.map((pos) => (
//                         <SelectItem key={pos.positionId} value={pos.positionId}>
//                           {pos.positionName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="salary">Salary</Label>
//                   <Input id="salary" name="salary" type="number" step="0.01" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="region">Region</Label>
//                   <Input id="region" name="region" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="note">Notes</Label>
//                 <Textarea id="note" name="note" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Add Employee</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <UserCheck className="h-5 w-5" />
//             Employee Directory
//           </CardTitle>
//           <CardDescription>{filteredEmployees.length} employees in your organization</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search employees..."
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
//                   <TableHead>Employee</TableHead>
//                   <TableHead>Contact</TableHead>
//                   <TableHead>Department</TableHead>
//                   <TableHead>Position</TableHead>
//                   <TableHead>Salary</TableHead>
//                   <TableHead>Performance</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredEmployees.map((employee) => (
//                   <motion.tr
//                     key={employee.employeeId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div>
//                         <div className="font-medium">
//                           {employee.firstName} {employee.lastName}
//                         </div>
//                         {employee.employeeCode && (
//                           <div className="text-sm text-muted-foreground">{employee.employeeCode}</div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         {employee.phone && (
//                           <div className="flex items-center gap-1 text-sm">
//                             <Phone className="h-3 w-3" />
//                             {employee.phone}
//                           </div>
//                         )}
//                         {employee.EmployeeInfo?.email && (
//                           <div className="flex items-center gap-1 text-sm">
//                             <Mail className="h-3 w-3" />
//                             {employee.EmployeeInfo.email}
//                           </div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>{employee.Department?.departmentName}</TableCell>
//                     <TableCell>{employee.Position?.positionName}</TableCell>
//                     <TableCell>{formatCurrency(employee.salary)}</TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         <div className="text-sm">Sales: {employee._count.Sale}</div>
//                         <div className="text-sm text-muted-foreground">Attendance: {employee._count.Attendance}</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
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
