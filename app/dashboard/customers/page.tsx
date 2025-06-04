

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
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Users, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCustomerStore } from "@/stores/customer-store"
import { useEmployeeStore } from "@/stores/employee-store"

export default function CustomersPage() {
  const {
    items: customers,
    isLoading: custLoading,
    error: custError,
    fetch: fetchCustomers,
    create,
    update,
    delete: deleteCustomer,
  } = useCustomerStore()

  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<"table" | "card">("table")
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  useEffect(() => {
    fetchCustomers()
    fetchEmployees()
  }, [fetchCustomers, fetchEmployees])

  const activeCustomers = customers.filter((cust) => cust.status === "active")

  const filteredCustomers = activeCustomers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Customer",
      render: (_value: any, row: any) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-sm text-muted-foreground capitalize">{row.gender}</div>
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
          {row.CustomerInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.CustomerInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, row: any) =>
        `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
        (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
    },
    {
      key: "Employee",
      label: "Assigned To",
      render: (_value: any, row: any) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "_count.Sale",
      label: "Sales",
      type: "badge" as const,
      render: (_value: any, row: any) => row._count?.Sale || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
    {
      key: "createdAt",
      label: "Joined",
      type: "date" as const,
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
      key: "gender",
      label: "Gender",
      secondary: true,
      render: (value: any) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "-",
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
          {row.CustomerInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.CustomerInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, row: any) =>
        `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
        (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
    },
    {
      key: "Employee",
      label: "Assigned To",
      render: (_value: any, row: any) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "_count.Sale",
      label: "Sales",
      type: "badge" as const,
      render: (_value: any, row: any) => row._count?.Sale || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
    {
      key: "createdAt",
      label: "Joined",
      type: "date" as const,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const customerData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      gender: formData.get("gender") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      region: formData.get("region") as string,
      note: formData.get("note") as string,
      employeeId: formData.get("employeeId") as string || null,
    }

    setIsSaving(true)
    try {
      const success = editingCustomer
        ? await update(editingCustomer.customerId, customerData)
        : await create(customerData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Customer ${editingCustomer ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingCustomer(null)
          ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Customer operation failed")
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingCustomer ? "update" : "create"} customer`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    const success = await deleteCustomer(customerId)
    if (success) {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchCustomers()
    fetchEmployees()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships and contact information</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${custLoading || empLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingCustomer(null)
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={employees.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? "Update customer details" : "Create a new customer record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      defaultValue={editingCustomer?.firstName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      defaultValue={editingCustomer?.lastName || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      defaultValue={editingCustomer?.gender || "male"}
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
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={editingCustomer?.phone || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingCustomer?.CustomerInfo?.email || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      name="region"
                      defaultValue={editingCustomer?.CustomerInfo?.region || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Assigned Employee</Label>
                  <Select
                    name="employeeId"
                    defaultValue={editingCustomer?.employeeId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notes</Label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    defaultValue={editingCustomer?.note || ""}
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
                        {editingCustomer ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCustomer ? (
                      "Update Customer"
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(custError || empError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{custError || empError}</p>
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
                <Users className="h-5 w-5" />
                Customer Directory
                {(custLoading || empLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredCustomers.length} customers in your database</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredCustomers}
              fields={cardFields}
              loading={custLoading || empLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="customerId"
              nameField="firstName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredCustomers}
              columns={tableColumns}
              loading={custLoading || empLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="customerId"
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
// import { Plus, Search, Users, Edit, Trash2, Eye, Phone, Mail } from "lucide-react"
// import { formatDate } from "@/lib/utils"
// import { Customer, Employee } from "@/lib/generated/prisma"
// import { useAppStore } from "@/lib/store/use-app-store"



// export default function CustomersPage() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
//   const {
//     customers,
//     employees,
//     fetchCustomers,
//     fetchEmployees,
//     isLoadingCustomers,
//     isLoadingEmployees
//   } = useAppStore();

//   useEffect(() => {
//     if (customers.length === 0 && !isLoadingCustomers)
//       fetchCustomers()
//     if (employees.length === 0 && !isLoadingEmployees)
//       fetchEmployees()
//   }, [])

//   console.log(customers)

//   const filteredCustomers = customers.filter(
//     (customer) =>
//       customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)

//     const customerData = {
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       gender: formData.get("gender"),
//       phone: formData.get("phone"),
//       email: formData.get("email"),
//       region: formData.get("region"),
//       note: formData.get("note"),
//       employeeId: formData.get("employeeId") || null,
//     }

//     try {
//       const response = await fetch("/api/customers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(customerData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         fetchCustomers()
//           ; (e.target as HTMLFormElement).reset()
//       }
//     } catch (error) {
//       console.error("Error adding customer:", error)
//     }
//   }

//   const handleDeleteCustomer = async (customerId: string) => {
//     if (!confirm("Are you sure you want to delete this customer?")) return

//     try {
//       const response = await fetch(`/api/customers/${customerId}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         fetchCustomers()
//       }
//     } catch (error) {
//       console.error("Error deleting customer:", error)
//     }
//   }

//   if (isLoadingCustomers) {
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
//           <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
//           <p className="text-muted-foreground">Manage your customer relationships and contact information</p>
//         </div>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Customer
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Add New Customer</DialogTitle>
//               <DialogDescription>Create a new customer record</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddCustomer} className="space-y-4">
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
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone</Label>
//                   <Input id="phone" name="phone" type="tel" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input id="email" name="email" type="email" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="region">Region</Label>
//                   <Input id="region" name="region" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="employeeId">Assigned Employee</Label>
//                 <Select name="employeeId">
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select employee (optional)" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {employees.map((employee) => (
//                       <SelectItem key={employee.employeeId} value={employee.employeeId}>
//                         {employee.firstName} {employee.lastName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="note">Notes</Label>
//                 <Textarea id="note" name="note" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Add Customer</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Customer Directory
//           </CardTitle>
//           <CardDescription>{filteredCustomers.length} customers in your database</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search customers..."
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
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Contact</TableHead>
//                   <TableHead>Location</TableHead>
//                   <TableHead>Assigned To</TableHead>
//                   <TableHead>Sales</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Joined</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredCustomers.map((customer) => (
//                   <motion.tr
//                     key={customer.customerId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div>
//                         <div className="font-medium">
//                           {customer.firstName} {customer.lastName}
//                         </div>
//                         <div className="text-sm text-muted-foreground capitalize">{customer.gender}</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         {customer.phone && (
//                           <div className="flex items-center gap-1 text-sm">
//                             <Phone className="h-3 w-3" />
//                             {customer.phone}
//                           </div>
//                         )}
//                         {customer?.CustomerInfo?.email && (
//                           <div className="flex items-center gap-1 text-sm">
//                             <Mail className="h-3 w-3" />
//                             {customer?.CustomerInfo.email}
//                           </div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {customer.Address?.City?.name || customer.CustomerInfo?.region || "-"}
//                       {customer.Address?.State?.name && `, ${customer.Address.State.name}`}
//                     </TableCell>
//                     <TableCell>
//                       {customer?.Employee ? `${customer?.Employee.firstName} ${customer?.Employee.lastName}` : "-"}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="secondary">{customer._count.Sale}</Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
//                     </TableCell>
//                     <TableCell>{formatDate(customer.createdAt)}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm">
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.customerId)}>
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
