import { create } from "zustand"

interface SalesReport {
  summary: {
    _sum: { amount: number }
    _count: number
    _avg: { amount: number }
  }
  topProducts: Array<{
    productId: string
    _sum: { quantity: number; amount: number }
    _count: number
    product: { productName: string; productCode: string }
  }>
  topCustomers: Array<{
    customerId: string
    _sum: { amount: number }
    _count: number
    customer: { firstName: string; lastName: string }
  }>
  salesByEmployee: Array<{
    employeeId: string
    _sum: { amount: number }
    _count: number
    employee: { firstName: string; lastName: string; department: { departmentName: string } }
  }>
}

interface InventoryReport {
  summary: {
    totalProducts: number
    lowStockCount: number
    outOfStockCount: number
    totalCostValue: number
    totalSellValue: number
    potentialProfit: number
  }
  lowStockItems: Array<{
    stockId: string
    quantity: number
    product: {
      productName: string
      productCode: string
      category: { categoryName: string }
    }
  }>
  recentEntries: Array<{
    entryId: string
    quantity: number
    entryPrice: number
    entryDate: string
    product: { productName: string }
    supplier: { supplierName: string }
  }>
}

interface ReportStore {
  salesReport: SalesReport | null
  inventoryReport: InventoryReport | null
  isLoading: boolean
  error: string | null
  fetchReports: (startDate: string, endDate: string) => Promise<void>
  clearError: () => void
}

export const useReportStore = create<ReportStore>((set) => ({
  salesReport: null,
  inventoryReport: null,
  isLoading: false,
  error: null,
  fetchReports: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      // Fetch sales report
      const salesUrl = `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
      const salesResponse = await fetch(salesUrl)
      if (!salesResponse.ok) throw new Error("Failed to fetch sales report")
      const salesData = await salesResponse.json()

      // Fetch inventory report
      const inventoryResponse = await fetch("/api/reports/inventory")
      if (!inventoryResponse.ok) throw new Error("Failed to fetch inventory report")
      const inventoryData = await inventoryResponse.json()

      set({
        salesReport: salesData,
        inventoryReport: inventoryData,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error.message || "Failed to fetch reports",
        isLoading: false,
        salesReport: null,
        inventoryReport: null,
      })
    }
  },
  clearError: () => set({ error: null }),
}))