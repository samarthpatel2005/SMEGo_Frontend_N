import axiosInstance from '@/lib/axios'

export interface ProductAnalytics {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalInventoryValue: number
  totalCostValue: number
  averageProductPrice: number
  averageStockValue: number
  inventoryTurnoverRatio: number
  categoryDistribution: Array<{
    category: string
    count: number
    percentage: number
    totalValue: number
    totalCost: number
    totalQuantity: number
    averageValuePerProduct: number
    potentialProfit: number
    profitMargin: string
    topProducts: Array<{
      name: string
      quantity: number
      value: number
    }>
  }>
  topProducts: Array<{
    _id: string
    name: string
    sku: string
    stock: number
    sellingPrice: number
    costPrice: number
    totalValue: number
    totalCost: number
    potentialProfit: number
    profitMargin: string
    category: string
    reorderPoint: number
    stockStatus: string
  }>
  stockAnalysis: {
    totalItems: number
    averageStockPerProduct: number
    stockDistribution: {
      inStock: number
      lowStock: number
      outOfStock: number
      overstocked: number
    }
    valueDistribution: {
      highValue: number
      mediumValue: number
      lowValue: number
    }
  }
  lowStockItems: Array<{
    _id: string
    name: string
    sku: string
    stock: number
    reorderPoint: number
    category: string
    stockValue: number
    urgency: string
  }>
  calculationExplanations: {
    totalInventoryValue: {
      value: number
      formula: string
      breakdown: Array<{
        product: string
        calculation: string
        value: number
      }>
    }
    totalCostValue: {
      value: number
      formula: string
      breakdown: Array<{
        product: string
        calculation: string
        value: number
      }>
    }
    averageProductPrice: {
      value: number
      formula: string
      calculation: string
    }
    averageStockValue: {
      value: number
      formula: string
      calculation: string
    }
    inventoryTurnoverRatio: {
      value: number
      formula: string
      calculation: string
    }
  }
  inventoryCalculations: Array<{
    productId: string
    name: string
    quantity: number
    sellingPrice: number
    costPrice: number
    stockValue: number
    costValue: number
    potentialProfit: number
    profitMargin: string
  }>
}

export interface TransactionAnalytics {
  totalTransactions: number
  totalPurchases: number
  totalSales: number
  totalAdjustments: number
  totalRevenue: number
  totalCost: number
  profit: number
  profitMargin: number
  averageTransactionValue: number
  averageQuantityPerSale: number
  totalQuantitySold: number
  monthlyTrends: Array<{
    month: string
    purchases: number
    sales: number
    revenue: number
    cost: number
    profit: number
  }>
  productPerformance: Array<{
    productId: string
    productName: string
    sku: string
    totalSold: number
    totalRevenue: number
    totalCost: number
    profit: number
    profitMargin: number
  }>
  categoryPerformance: Array<{
    category: string
    totalSold: number
    totalRevenue: number
    totalCost: number
    profit: number
  }>
  purchaseAnalysis: {
    totalPurchases: number
    totalPurchaseValue: number
    totalPurchaseQuantity: number
    averagePurchaseSize: number
  }
  financialCalculations: {
    totalRevenue: {
      value: number
      formula: string
      breakdown: Array<{
        transactionId: string
        productName: string
        quantity: number
        unitPrice: number
        revenue: number
        date: string
        calculation: string
      }>
      totalTransactions: number
    }
    totalCost: {
      value: number
      formula: string
      breakdown: Array<{
        transactionId: string
        productName: string
        quantity: number
        unitCost: number
        cost: number
        date: string
        calculation: string
      }>
      totalTransactions: number
    }
    profit: {
      value: number
      formula: string
      calculation: string
      profitMargin: number
    }
    profitMargin: {
      value: number
      formula: string
      calculation: string
    }
    averageTransactionValue: {
      value: number
      formula: string
      calculation: string
    }
    averageQuantityPerSale: {
      value: number
      formula: string
      calculation: string
    }
  }
  transactionVelocity: {
    dailyAverage: {
      sales: number
      purchases: number
      total: number
    }
    peakDays: any[]
    trends: any[]
  }
  performanceMetrics: {
    bestPerformingCategory: string
    worstPerformingCategory: string
    topProduct: any
    profitabilityScore: string
    salesGrowth: number
  }
  revenueBreakdown: Array<{
    transactionId: string
    productName: string
    quantity: number
    unitPrice: number
    revenue: number
    date: string
    calculation: string
  }>
  costBreakdown: Array<{
    transactionId: string
    productName: string
    quantity: number
    unitCost: number
    cost: number
    date: string
    calculation: string
  }>
}

export interface InventoryAnalytics {
  totalValue: number
  totalCostValue: number
  potentialProfit: number
  productCount: number
  stockTurnover: number
  averageStockValue: number
  categoryBreakdown: Array<{
    category: string
    products: number
    stockValue: number
    costValue: number
    percentage: number
  }>
}

export interface DashboardAnalytics {
  products: ProductAnalytics
  transactions: TransactionAnalytics
  inventory: InventoryAnalytics
  transactionBreakdown: {
    [productName: string]: {
      quantity: number
      revenue: number
      cost: number
      profit: number
      unitPrice: number
      unitCost: number
    }
  }
  summary: {
    totalProductsCreated: number
    totalTransactionsCompleted: number
    currentMonthRevenue: number
    currentMonthProfit: number
    inventoryTurnover: number
    topSellingCategory: string
    lowStockAlerts: number
    organizationId: string
  }
}

export interface DateRange {
  startDate?: string
  endDate?: string
  period?: 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

class AnalyticsService {
  private checkAuth(): void {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('AnalyticsService: No authentication token found')
      throw new Error('Authentication required. Please log in.')
    }
  }

  async getProductAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: ProductAnalytics }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching product analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/products', {
        params: dateRange
      })
      console.log('AnalyticsService: Product analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch product analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getTransactionAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: TransactionAnalytics }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching transaction analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/transactions', {
        params: dateRange
      })
      console.log('AnalyticsService: Transaction analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch transaction analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getInventoryAnalytics(): Promise<{ success: boolean; data: InventoryAnalytics }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching inventory analytics')
      const response = await axiosInstance.get('/analytics/inventory')
      console.log('AnalyticsService: Inventory analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch inventory analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getDashboardAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: DashboardAnalytics }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching dashboard analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/dashboard', {
        params: dateRange
      })
      console.log('AnalyticsService: Dashboard analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch dashboard analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getRevenueAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: any }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching revenue analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/revenue', {
        params: dateRange
      })
      console.log('AnalyticsService: Revenue analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch revenue analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getProfitAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: any }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching profit analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/profit', {
        params: dateRange
      })
      console.log('AnalyticsService: Profit analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch profit analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getCategoryAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: any }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching category analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/categories', {
        params: dateRange
      })
      console.log('AnalyticsService: Category analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch category analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }

  async getStockMovementAnalytics(dateRange?: DateRange): Promise<{ success: boolean; data: any }> {
    try {
      this.checkAuth()
      console.log('AnalyticsService: Fetching stock movement analytics with range:', dateRange)
      const response = await axiosInstance.get('/analytics/stock-movement', {
        params: dateRange
      })
      console.log('AnalyticsService: Stock movement analytics fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AnalyticsService: Failed to fetch stock movement analytics:', error)
      console.error('AnalyticsService: Error response:', error.response?.data)
      console.error('AnalyticsService: Error status:', error.response?.status)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
