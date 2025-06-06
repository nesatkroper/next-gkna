"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ShoppingCart, Eye, DollarSign, TrendingUp, Package } from "lucide-react"
import { formatCurrency, formatDate, generateInvoiceCode } from "@/lib/utils"
import { useCustomerStore, useEmployeeStore, useProductStore, useSaleStore } from "@/stores"
import { useBranchStore } from "@/stores/branch-store"

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saleItems, setSaleItems] = useState([{ productId: "", quantity: 1, price: 0 }])
  const [saleDate, setSaleDate] = useState<Date>(new Date())
  const inv = generateInvoiceCode();

  const {
    items: Customer,
    fetch: cusFetch,
  } = useCustomerStore();

  const {
    items: Employee,
    fetch: empFetch
  } = useEmployeeStore();

  const {
    items: Product,
    fetch: proFetch
  } = useProductStore();

  const {
    items: Sale,
    fetch: salFetch,
    isLoading
  } = useSaleStore()

  const {
    items: Branch,
    fetch: brcFetch
  } = useBranchStore();

  useEffect(() => {
    salFetch()
    cusFetch()
    empFetch()
    proFetch()
    brcFetch()
  }, [cusFetch, empFetch, proFetch, salFetch, brcFetch])

  const filteredSales = Sale.filter(
    (sale) =>
      sale.Customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.Customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoice?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updated = [...saleItems]
    updated[index] = { ...updated[index], [field]: value }
    setSaleItems(updated)
  }

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const handleAddSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const saleData = {
      customerId: formData.get("customerId"),
      employeeId: formData.get("employeeId"),
      amount: calculateTotal(),
      invoice: formData.get("invoice"),
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        amount: item.quantity * item.price,
      })),
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        salFetch()
        setSaleItems([{ productId: "", quantity: 1, price: 0 }])
          ; (e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error("Error adding sale:", error)
    }
  }

  // Calculate stats
  const totalSales = Sale.reduce((sum, sale) => sum + sale.amount, 0)
  const todaySales = Sale.filter((sale) => {
    const today = new Date().toDateString()
    return new Date(sale.saleDate).toDateString() === today
  })
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount, 0)

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Track and manage your sales transactions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
              <DialogDescription>Record a new sales transaction</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <Select name="customerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {Customer.map((customer) => (
                        <SelectItem key={customer.customerId} value={customer.customerId}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice Number</Label>
                  <Input id="invoice" name="invoice" value={inv} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch</Label>
                  <Select name="branchId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Leave to choose current" />
                    </SelectTrigger>
                    <SelectContent>
                      {Branch.map((branch) => (
                        <SelectItem key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <DatePicker
                    date={saleDate}
                    onDateChange={setSaleDate}
                    placeholder="Select date of birth"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Sale Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {saleItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          const product = Product.find((p) => p.productId === value)
                          updateSaleItem(index, "productId", value)
                          updateSaleItem(index, "price", product?.sellPrice || 0)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {Product.map((product) => (
                            <SelectItem key={product.productId} value={product.productId}>
                              {product.productName} - {formatCurrency(product.sellPrice)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, "quantity", Number.parseInt(e.target.value))}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateSaleItem(index, "price", Number.parseFloat(e.target.value))}
                        placeholder="Price"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">{formatCurrency(item.quantity * item.price)}</div>
                    </div>
                    <div className="col-span-1">
                      {saleItems.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeSaleItem(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <div className="text-lg font-semibold">Total: {formatCurrency(calculateTotal())}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Sale</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Sales Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">All time sales</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">{todaySales.length} transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Sale.length}</div>
              <p className="text-xs text-muted-foreground">Completed sales</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(Sale.length > 0 ? totalSales / Sale.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Sales History
          </CardTitle>
          <CardDescription>{filteredSales.length} sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
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
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <motion.tr key={sale.saleId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
                    <TableCell>
                      <div className="font-medium">{sale.invoice || "-"}</div>
                    </TableCell>
                    <TableCell>
                      {sale.Customer.firstName} {sale.Customer.lastName}
                    </TableCell>
                    <TableCell>
                      {sale.Employee.firstName} {sale.Employee.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sale.Saledetails.slice(0, 2).map((detail, index) => (
                          <div key={index} className="text-sm">
                            {detail.quantity}x {detail.Product.productName}
                          </div>
                        ))}
                        {sale.Saledetails.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{sale.Saledetails.length - 2} more items</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(sale.amount)}</div>
                    </TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "active" ? "default" : "secondary"}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
