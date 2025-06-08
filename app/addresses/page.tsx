
"use client"

export const dynamic = 'force-dynamic';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, MapPin, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAddressStore } from "@/stores/address-store"
import { useCityStore } from "@/stores/city-store"
import { useStateStore } from "@/stores/state-store"
import { useCustomerStore } from "@/stores/customer-store"
import { useEmployeeStore } from "@/stores/employee-store"
import { useSupplierStore } from "@/stores/supplier-store"
import { useEventStore } from "@/stores/event-store"
import { useTranslation } from "react-i18next"

export default function AddressPage() {
  const { t } = useTranslation('common')
  const {
    items: addresses,
    isLoading: addrLoading,
    error: addrError,
    fetch: fetchAddresses,
    create,
    update,
    delete: deleteAddress,
  } = useAddressStore()

  const {
    items: cities,
    isLoading: cityLoading,
    error: cityError,
    fetch: fetchCities,
  } = useCityStore()

  const {
    items: states,
    isLoading: stateLoading,
    error: stateError,
    fetch: fetchStates,
  } = useStateStore()

  const {
    items: customers,
    isLoading: custLoading,
    error: custError,
    fetch: fetchCustomers,
  } = useCustomerStore()

  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore()

  const {
    items: suppliers,
    isLoading: supLoading,
    error: supError,
    fetch: fetchSuppliers,
  } = useSupplierStore()

  const {
    items: events,
    isLoading: eventLoading,
    error: eventError,
    fetch: fetchEvents,
  } = useEventStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<"table" | "card">("table")
  const [editingAddress, setEditingAddress] = useState<any>(null)

  useEffect(() => {
    fetchAddresses()
    fetchCities()
    fetchStates()
    fetchCustomers()
    fetchEmployees()
    fetchSuppliers()
    fetchEvents()
  }, [fetchAddresses, fetchCities, fetchStates, fetchCustomers, fetchEmployees, fetchSuppliers, fetchEvents])

  console.log("Addresses:", addresses)
  console.log("Cities:", cities)
  console.log("States:", states)
  console.log("Customers:", customers)
  console.log("Employees:", employees)
  console.log("Suppliers:", suppliers)
  console.log("Events:", events)

  const activeAddresses = addresses.filter((addr) => addr.status === "active")

  const filteredAddresses = activeAddresses.filter(
    (address) =>
      address.City?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.State?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.supplier?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Event?.eventName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "City.name",
      label: "City",
      render: (_value: any, row: any) => row.City?.name || "-",
    },
    {
      key: "State.name",
      label: "State",
      render: (_value: any, row: any) => row.State?.name || "-",
    },
    {
      key: "coordinates",
      label: "Coordinates",
      render: (_value: any, row: any) =>
        row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
    },
    {
      key: "relatedEntity",
      label: "Related Entity",
      render: (_value: any, row: any) =>
        row.Customer
          ? `${row.Customer.firstName} ${row.Customer.lastName} (Customer)`
          : row.Employee
            ? `${row.Employee.firstName} ${row.Employee.lastName} (Employee)`
            : row.supplier
              ? `${row.supplier.supplierName} (Supplier)`
              : row.Event
                ? `${row.Event.eventName} (Event)`
                : "-",
    },
    {
      key: "Imageaddress",
      label: "Images",
      type: "badge" as const,
      render: (_value: any, row: any) => row.Imageaddress?.length || 0,
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

  const cardFields = [
    {
      key: "location",
      primary: true,
      render: (_value: any, row: any) =>
        `${row.City?.name || "-"}` + (row.State?.name ? `, ${row.State.name}` : ""),
    },
    {
      key: "coordinates",
      label: "Coordinates",
      secondary: true,
      render: (_value: any, row: any) =>
        row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
    },
    {
      key: "relatedEntity",
      label: "Related Entity",
      render: (_value: any, row: any) =>
        row.Customer
          ? `${row.Customer.firstName} ${row.Customer.lastName} (Customer)`
          : row.Employee
            ? `${row.Employee.firstName} ${row.Employee.lastName} (Employee)`
            : row.supplier
              ? `${row.supplier.supplierName} (Supplier)`
              : row.Event
                ? `${row.Event.eventName} (Event)`
                : "-",
    },
    {
      key: "Imageaddress",
      label: "Images",
      type: "badge" as const,
      render: (_value: any, row: any) => row.Imageaddress?.length || 0,
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
    const addressData = {
      cityId: formData.get("cityId") ? Number(formData.get("cityId")) : null,
      stateId: formData.get("stateId") ? Number(formData.get("stateId")) : null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      customerId: formData.get("customerId") as string || null,
      employeeId: formData.get("employeeId") as string || null,
      supplierId: formData.get("supplierId") as string || null,
      eventId: formData.get("eventId") as string || null,
    }

    setIsSaving(true)
    try {
      const success = editingAddress
        ? await update(editingAddress.addressId, addressData)
        : await create(addressData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Address ${editingAddress ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingAddress(null)
          ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Address operation failed")
      }
    } catch (error: any) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingAddress ? "update" : "create"} address`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (address: any) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    const success = await deleteAddress(addressId)
    if (success) {
      toast({
        title: "Success",
        description: "Address deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchAddresses()
    fetchCities()
    fetchStates()
    fetchCustomers()
    fetchEmployees()
    fetchSuppliers()
    fetchEvents()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Addresses')}</h1>
          <p className="text-muted-foreground">{t('Manage location data for your organization')}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={addrLoading || cityLoading || stateLoading || custLoading || empLoading || supLoading || eventLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${addrLoading || cityLoading || stateLoading || custLoading || empLoading || supLoading || eventLoading ? "animate-spin" : ""}`}
            />
            {t('Refresh')}
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingAddress(null)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Address')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? "Update address details" : "Create a new address record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cityId">{t('City')}</Label>
                    <Select name="cityId" defaultValue={editingAddress?.cityId?.toString() ?? ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">{t('None')}</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.cityId} value={city.cityId.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateId">{t("State")}</Label>
                    <Select name="stateId" defaultValue={editingAddress?.stateId ?? ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">{t('None')}</SelectItem>
                        {states.map((state) => (
                          <SelectItem key={state.stateId} value={state.stateId.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">{t('Latitude')}</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      defaultValue={editingAddress?.latitude || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">{t("Longitude")}</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      defaultValue={editingAddress?.longitude || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId">{t("Customer")}</Label>
                  <Select name="customerId" defaultValue={editingAddress?.customerId ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">{t('None')}</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.customerId} value={customer.customerId}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}

                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t("Employee")}</Label>
                  <Select name="employeeId" defaultValue={editingAddress?.employeeId ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">{t('None')}</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierId">{t("Supplier")}</Label>
                  <Select name="supplierId" defaultValue={editingAddress?.supplierId ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">{t('None')}</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                          {supplier.supplierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventId">{t("Event")}</Label>
                  <Select name="eventId" defaultValue={editingAddress?.eventId ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('None')}</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.eventId} value={event.eventId}>
                          {event.eventName}
                        </SelectItem>
                      )) ?? null}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAddress ? "Updating..." : "Creating..."}
                      </>
                    ) : editingAddress ? (
                      "Update Address"
                    ) : (
                      "Create Address"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(addrError || cityError || stateError || custError || empError || supError || eventError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">
                  {addrError || cityError || stateError || custError || empError || supError || eventError}
                </p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
                {t("  Try Again")}
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
                <MapPin className="h-5 w-5" />
                Address Directory
                {(addrLoading || cityLoading || stateLoading || custLoading || empLoading || supLoading || eventLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>{filteredAddresses.length} addresses in your database</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredAddresses}
              fields={cardFields}
              loading={addrLoading || cityLoading || stateLoading || custLoading || empLoading || supLoading || eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="addressId"
              nameField="City.name"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredAddresses}
              columns={tableColumns}
              loading={addrLoading || cityLoading || stateLoading || custLoading || empLoading || supLoading || eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="addressId"
              nameField="City.name"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
