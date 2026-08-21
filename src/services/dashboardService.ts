import axiosInstance from '@/lib/axios'

export interface DashboardAnalytics {
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
    revenue: number
    profit: number
    cogs: number
    profitMargin: string
    monthlyTrend: Array<{
      _id: { year: number; month: number }
      revenue: number
      count: number
    }>
  }
  products: {
    total: number
    active: number
    tracked: number
    categoryBreakdown: Array<{
      _id: string
      count: number
      totalValue: number
    }>
  }
  transactions: {
    total: number
    typeBreakdown: Array<{
      _id: string
      count: number
      totalValue: number
    }>
    dailyTrend: Array<{
      _id: { year: number; month: number; day: number }
      count: number
      value: number
    }>
  }
  inventory: {
    totalProducts: number
    totalStockValue: number
    totalCostValue: number
    potentialProfit: number
    lowStockProducts: any[]
    lowStockCount: number
  }
  recent: {
    invoices: Array<{
      _id: string
      invoiceNumber: string
      client: { name: string }
      totalAmount: number
      status: string
      createdAt: string
      dueDate: string
    }>
    transactions: Array<{
      _id: string
      type: string
      quantity: number
      product: { name: string; sku: string }
      performedBy: { firstName: string; lastName: string }
      createdAt: string
      reason: string
    }>
  }
  period: string
}

export interface SalesPerformance {
  topProducts: Array<{
    _id: string
    totalRevenue: number
    totalQuantity: number
    totalProfit: number
    product: {
      _id: string
      name: string
      sku: string
      category?: string
    }
  }>
}

export interface InventoryAlerts {
  lowStock: any[]
  zeroStock: any[]
  overStock: any[]
  summary: {
    lowStockCount: number
    zeroStockCount: number
    overStockCount: number
  }
}

class DashboardService {
  async getAnalytics(period: number = 30): Promise<{ success: boolean; data: DashboardAnalytics }> {
    const response = await axiosInstance.get('/dashboard/analytics', {
      params: { period }
    })
    return response.data
  }

  async getSalesPerformance(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data: SalesPerformance }> {
    const response = await axiosInstance.get('/dashboard/sales-performance', { params })
    return response.data
  }

  async getInventoryAlerts(): Promise<{ success: boolean; data: InventoryAlerts }> {
    const response = await axiosInstance.get('/dashboard/inventory-alerts')
    return response.data
  }
}

export const dashboardService = new DashboardService()
