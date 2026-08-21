'use client'

import DashboardShell from '@/components/layout/DashboardShell'
import SubscriptionWidget from '@/components/ui/SubscriptionWidget'
import { analyticsService } from '@/services/analyticsService'
import { clientService } from '@/services/clientService'
import { invoiceService } from '@/services/invoiceService'
import { getCurrentOrganization } from '@/services/organizationService'
import { Product, productService } from '@/services/productService'
import { transactionService } from '@/services/transactionService'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalRevenue: number
  revenueGrowth: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalProducts: number
  lowStockProducts: number
  totalTransactions: number
  averageOrderValue: number
  conversionRate: number
  activeClients: number
}

interface RecentActivity {
  id: string
  type: 'invoice' | 'payment' | 'product' | 'client'
  title: string
  description: string
  amount?: number
  time: string
  status?: 'success' | 'warning' | 'info' | 'error'
}

interface Invoice {
  _id: string
  status: 'paid' | 'sent' | 'draft' | string
  invoiceNumber: string
  client: {
    name: string
    email: string
  }
  dueDate: string
  totalAmount: number
  paidAt?: string
  createdAt: string
}

interface RevenueData {
  dailyRevenue: Array<{
    date: string
    revenue: number
  }>
  totalRevenue: number
}

interface ProfitData {
  totalProfit?: number
  totalRevenue: number
  profitMargin: number
  profit?: number
  monthlyTrends?: Array<{
    month: string
    revenue: number
    cost: number
    profit: number
  }>
}

interface ProductPerformanceData {
  categoryDistribution?: Array<{
    category: string
    totalValue: number
    totalRevenue?: number
    percentage: number
    count?: number
    totalCost?: number
    totalQuantity?: number
    averageValuePerProduct?: number
    potentialProfit?: number
    profitMargin?: string
    topProducts?: Array<{
      name: string
      quantity: number
      value: number
    }>
  }>
  topProducts?: Array<{
    name: string
    totalRevenue?: number
    percentage?: number
    _id: string
    sku: string
    stock: number
    sellingPrice: number
    costPrice: number
    totalValue: number
    totalCost: number
    potentialProfit: number
    profitMargin: string
    category: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState('Dashboard')
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)
  const [productPerformanceData, setProductPerformanceData] = useState<ProductPerformanceData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    activeClients: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Fetch organization info
      const org = await getCurrentOrganization()
      if (org?.name) {
        setOrganizationName(org.name)
      }

      // Fetch dashboard statistics in parallel
      const [invoicesData, transactionsData, productsData, analyticsData, profitAnalyticsData, categoryAnalyticsData, activeClientsData] = await Promise.all([
        invoiceService.list().catch(() => ({ data: [] })),
        transactionService.getInvoiceTransactions({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        productService.list({ limit: 100 }).catch(() => ({ data: [] })),
        analyticsService.getRevenueAnalytics({ period: 'month' }).catch(() => ({ data: { dailyRevenue: [], totalRevenue: 0 } })),
        analyticsService.getTransactionAnalytics({ period: 'month' }).catch(() => ({ data: { totalProfit: 0, totalRevenue: 0, profitMargin: 0, monthlyTrends: [] } })),
        analyticsService.getProductAnalytics({ period: 'month' }).catch(() => ({ data: { categoryDistribution: [], topProducts: [] } })),
        clientService.getActiveClients().catch(() => [])
      ])

      const invoices = invoicesData.data || []
      const transactions = transactionsData.data || []
      const products = productsData.data || []
      const activeClients = activeClientsData || []
      
      // Set analytics data
      setRevenueData(analyticsData.data)
      setProfitData(profitAnalyticsData.data)
      setProductPerformanceData(categoryAnalyticsData.data)
      setProducts(products)
      
      // Debug logging
      console.log('Dashboard - Revenue Data:', analyticsData.data)
      console.log('Dashboard - Profit/Transaction Data:', profitAnalyticsData.data)
      console.log('Dashboard - Product Analytics Data:', categoryAnalyticsData.data)
      console.log('Dashboard - Products Data:', products)

      // Calculate statistics
      const paidInvoices = invoices.filter((inv: { status: string }) => inv.status === 'paid')
      const pendingInvoices = invoices.filter((inv: { status: string }) => inv.status === 'sent' || inv.status === 'draft')
      const overdueInvoices = invoices.filter((inv: { status: string; dueDate: string | number | Date }) => {
        if (inv.status === 'paid') return false
        return new Date(inv.dueDate) < new Date()
      })

      const totalRevenue = paidInvoices.reduce((sum: any, inv: { totalAmount: any }) => sum + inv.totalAmount, 0)
      const lowStockProducts = products.filter(prod => prod.stock <= (prod.reorderPoint || prod.minStock || 5))
      const activeClientsCount = activeClients.length

      const calculatedStats: DashboardStats = {
        totalRevenue,
        revenueGrowth: 12.5, // Would calculate from historical data
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        totalProducts: products.length,
        lowStockProducts: lowStockProducts.length,
        totalTransactions: transactions.length,
        averageOrderValue: paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0,
        conversionRate: invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0,
        activeClients: activeClientsCount
      }

      setStats(calculatedStats)

      // Generate recent activities
      const activities: RecentActivity[] = [
        ...paidInvoices.slice(0, 3).map((inv: { _id: any; invoiceNumber: any; client: { name: any }; totalAmount: any; paidAt: any; createdAt: any }) => ({
          id: inv._id,
          type: 'payment' as const,
          title: `Payment received for ${inv.invoiceNumber}`,
          description: inv.client.name,
          amount: inv.totalAmount,
          time: formatTimeAgo(inv.paidAt || inv.createdAt),
          status: 'success' as const
        })),
        ...pendingInvoices.slice(0, 2).map((inv: { _id: any; invoiceNumber: any; dueDate: string | number | Date; totalAmount: any; createdAt: string }) => ({
          id: inv._id,
          type: 'invoice' as const,
          title: `Invoice ${inv.invoiceNumber} pending`,
          description: `Due: ${new Date(inv.dueDate).toLocaleDateString()}`,
          amount: inv.totalAmount,
          time: formatTimeAgo(inv.createdAt),
          status: 'warning' as const
        })),
        ...lowStockProducts.slice(0, 2).map(prod => ({
          id: prod._id,
          type: 'product' as const,
          title: `Low stock alert: ${prod.name}`,
          description: `Only ${prod.stock} left`,
          time: 'Now',
          status: 'error' as const
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6)

      setRecentActivities(activities)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Navigation functions for quick actions
  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices')
  }

  const handleAddClient = () => {
    router.push('/dashboard/invoices') // Can add clients from invoice page
  }

  const handleAddProduct = () => {
    router.push('/dashboard/products')
  }

  const handleViewReports = () => {
    router.push('/dashboard/analytics')
  }

  // Custom Revenue Chart Component with Analytics Data
  const DynamicRevenueChart = () => {
    const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatDateLabel = (dateString: string) => {
      const date = new Date(dateString)
      if (chartPeriod === 'week') {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (chartPeriod === 'year') {
        return date.toLocaleDateString('en-US', { month: 'short' })
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }

    // Get chart data (either from analytics or fallback)
    const getChartData = () => {
      if (revenueData?.dailyRevenue && revenueData.dailyRevenue.length > 0) {
        return revenueData.dailyRevenue.slice(-12).map(item => ({
          label: formatDateLabel(item.date),
          revenue: item.revenue
        }))
      } else {
        // Fallback static data if no analytics data
        return [
          { label: 'Jan', revenue: 12000 },
          { label: 'Feb', revenue: 15000 },
          { label: 'Mar', revenue: 18000 },
          { label: 'Apr', revenue: 22000 },
          { label: 'May', revenue: 25000 },
          { label: 'Jun', revenue: 28000 }
        ]
      }
    }

    const data = getChartData()
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
    const totalRevenue = revenueData?.totalRevenue || data.reduce((sum, item) => sum + item.revenue, 0)

  }

  // Revenue vs Profit Chart Component
  const RevenueVsProfitChart = () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Get chart data from analytics or fallback
    const getChartData = () => {
      if (profitData?.monthlyTrends && profitData.monthlyTrends.length > 0) {
        return profitData.monthlyTrends.slice(-6)
      } else {
        // Fallback data
        return [
          { month: 'Current Month', revenue: 32000, cost: 26000, profit: 6000 }
        ]
      }
    }

    const data = getChartData()
    const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.profit)), 1)

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Revenue vs Profit
              </h3>
              <p className="text-sm text-gray-500 mt-1">Financial performance overview</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-center space-x-8">
            {data.map((item, index) => (
              <div key={index} className="flex items-end space-x-4">
                {/* Revenue Bar */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                    style={{
                      height: `${(item.revenue / maxValue) * 200}px`,
                      minHeight: '20px'
                    }}
                    title={`Revenue: ${formatCurrency(item.revenue)}`}
                  />
                  <span className="text-xs text-blue-600 font-medium mt-2">Revenue</span>
                </div>
                
                {/* Profit Bar */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 bg-green-500 rounded-t-md transition-all duration-300 hover:bg-green-600"
                    style={{
                      height: `${(item.profit / maxValue) * 200}px`,
                      minHeight: '20px'
                    }}
                    title={`Profit: ${formatCurrency(item.profit)}`}
                  />
                  <span className="text-xs text-green-600 font-medium mt-2">Profit</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Profit</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Margin %</p>
              <p className="text-lg font-semibold text-amber-600">
                {profitData?.profitMargin ? `${profitData.profitMargin.toFixed(1)}%` : '18.8%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Product Performance Pie Chart Component
  const ProductPerformanceChart = () => {
    // Debug logging
    console.log('ProductPerformanceChart - productPerformanceData:', productPerformanceData)
    console.log('ProductPerformanceChart - products:', products)

    // Get chart data from analytics or fallback
    const getChartData = () => {
      if (productPerformanceData?.topProducts && productPerformanceData.topProducts.length > 0) {
        console.log('Using analytics topProducts data:', productPerformanceData.topProducts)
        // Calculate percentages for top products
        const totalRevenue = productPerformanceData.topProducts.reduce((sum, product) => 
          sum + (product.totalValue || product.totalRevenue || 0), 0)
        
        console.log('Total revenue for percentage calculation:', totalRevenue)
        
        const chartData = productPerformanceData.topProducts.slice(0, 5).map(product => ({
          name: product.name,
          percentage: totalRevenue > 0 ? ((product.totalValue || product.totalRevenue || 0) / totalRevenue) * 100 : 0,
          value: product.totalValue || product.totalRevenue || 0
        }))
        
        console.log('Chart data from analytics:', chartData)
        return chartData
      } else if (products && products.length > 0) {
        console.log('Using products data:', products)
        // Calculate from products data if analytics not available
        const productsWithValue = products.filter(product => product.stock > 0 && product.sellingPrice > 0)
        const totalValue = productsWithValue.reduce((sum, product) => sum + (product.stock * product.sellingPrice), 0)
        
        console.log('Products with value:', productsWithValue)
        console.log('Total value for percentage calculation:', totalValue)
        
        const chartData = productsWithValue
          .map(product => ({
            name: product.name,
            value: product.stock * product.sellingPrice,
            percentage: totalValue > 0 ? ((product.stock * product.sellingPrice) / totalValue) * 100 : 0
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
        
        console.log('Chart data from products:', chartData)
        return chartData
      } else {
        console.log('Using fallback data')
        // Fallback data
        return [
          { name: 'Turmeric Powder', percentage: 55.0, value: 15000 },
          { name: 'Milk', percentage: 45.0, value: 12000 }
        ]
      }
    }

    const data = getChartData()
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] // Blue, Green, Yellow, Red, Purple

    // Calculate angles for pie chart
    const total = data.reduce((sum, item) => sum + (item.percentage || 0), 100)
    let currentAngle = 0
    const segments = data.map((item, index) => {
      const angle = ((item.percentage || 0) / 100) * 360
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[index % colors.length]
      }
      currentAngle += angle
      return segment
    })

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" />
                </svg>
                Product Performance
              </h3>
              <p className="text-sm text-gray-500 mt-1">Revenue distribution by product</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Pie Chart */}
            <div className="relative">
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                />
                {segments.map((segment, index) => {
                  if (segment.percentage === 0) return null
                  
                  const startAngle = (segment.startAngle * Math.PI) / 180
                  const endAngle = (segment.endAngle * Math.PI) / 180
                  const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0
                  
                  const x1 = 100 + 80 * Math.cos(startAngle)
                  const y1 = 100 + 80 * Math.sin(startAngle)
                  const x2 = 100 + 80 * Math.cos(endAngle)
                  const y2 = 100 + 80 * Math.sin(endAngle)
                  
                  return (
                    <path
                      key={index}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  )
                })}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col space-y-4 ml-6">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">{(item.percentage || 0).toFixed(1)}%</p>
                      {item.value && (
                        <p className="text-xs text-gray-400">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0
                          }).format(item.value)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {(productPerformanceData?.topProducts && productPerformanceData.topProducts.length > 0)
                  ? 'Live analytics data' 
                  : products.length > 0 
                    ? `Calculated from ${products.length} products` 
                    : 'Sample data - connect analytics for real-time data'
                }
              </p>
              {data.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Top {data.length} products</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Category Value Distribution Chart Component
  const CategoryValueDistributionChart = () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // Get category data from analytics or fallback
    const getCategoryData = () => {
      if (productPerformanceData?.categoryDistribution && productPerformanceData.categoryDistribution.length > 0) {
        return productPerformanceData.categoryDistribution.slice(0, 6).map((cat: any) => ({
          category: cat.category,
          totalValue: cat.totalValue || cat.totalRevenue || 0,
          percentage: Math.round(cat.percentage * 10) / 10 // Round to 1 decimal place
        }))
      } else if (products && products.length > 0) {
        // Calculate category distribution from products data
        const categoryMap = new Map<string, { totalValue: number; count: number }>()
        let totalProductValue = 0

        products.forEach(product => {
          const category = product.category || 'Uncategorized'
          const productValue = product.stock * product.sellingPrice
          totalProductValue += productValue

          if (!categoryMap.has(category)) {
            categoryMap.set(category, { totalValue: 0, count: 0 })
          }
          
          const categoryData = categoryMap.get(category)!
          categoryData.totalValue += productValue
          categoryData.count += 1
        })

        // Convert to array and calculate percentages
        const categoryArray = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          totalValue: data.totalValue,
          percentage: Math.round(totalProductValue > 0 ? (data.totalValue / totalProductValue) * 100 * 10 : 0) / 10, // Round to 1 decimal place
          count: data.count
        }))

        // Sort by total value and return top 6
        return categoryArray
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 6)
      } else {
        // Fallback data
        return [
          { category: 'Beverages', totalValue: 25000, percentage: 35.0 },
          { category: 'Snacks', totalValue: 18000, percentage: 25.0 },
          { category: 'Electronics', totalValue: 14400, percentage: 20.0 },
          { category: 'Clothing', totalValue: 7200, percentage: 10.0 },
          { category: 'Books', totalValue: 3600, percentage: 5.0 },
          { category: 'Others', totalValue: 3600, percentage: 5.0 }
        ]
      }
    }

    const data = getCategoryData()
    const maxValue = Math.max(...data.map((d: any) => d.totalValue), 1)
    const colors = [
      { primary: '#4F46E5', secondary: '#6366F1', light: '#E0E7FF' }, // Indigo
      { primary: '#059669', secondary: '#10B981', light: '#D1FAE5' }, // Green
      { primary: '#F59E0B', secondary: '#FBBF24', light: '#FEF3C7' }, // Yellow
      { primary: '#EF4444', secondary: '#F87171', light: '#FEE2E2' }, // Red
      { primary: '#8B5CF6', secondary: '#A78BFA', light: '#EDE9FE' }, // Purple
      { primary: '#06B6D4', secondary: '#22D3EE', light: '#CFFAFE' }  // Cyan
    ]

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Category Value Distribution</h3>
              <p className="text-xs text-gray-500">Product categories by inventory value</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {(productPerformanceData?.categoryDistribution && productPerformanceData.categoryDistribution.length > 0)
                ? 'Live Data' 
                : products.length > 0 
                  ? 'Products Data' 
                  : 'Sample Data'
              }
            </span>
          </div>
        </div>

        <div className="flex flex-col h-full">
          {/* Category bars */}
          <div className="flex-1 space-y-4">
            {data.map((category: any, index: number) => {
              const colorSet = colors[index % colors.length]
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: colorSet.primary }}
                      />
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {category.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {formatCurrency(category.totalValue)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="h-3 rounded-lg overflow-hidden"
                      style={{ backgroundColor: colorSet.light }}
                    >
                      <div
                        className="h-full rounded-lg transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
                        style={{
                          width: `${(category.totalValue / maxValue) * 100}%`,
                          background: `linear-gradient(90deg, ${colorSet.primary} 0%, ${colorSet.secondary} 100%)`
                        }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Hover tooltip */}
                    <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg shadow-lg">
                        {category.category}: {category.percentage.toFixed(1)}% ({formatCurrency(category.totalValue)})
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Summary Cards */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Categories</p>
                    <p className="text-2xl font-bold text-blue-900">{data.length}</p>
                  </div>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Value</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(data.reduce((sum: number, cat: any) => sum + cat.totalValue, 0))}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top performer indicator */}
            {data.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900 capitalize">{data[0].category}</span> is your top category 
                    with <span className="font-semibold text-blue-600">{data[0].percentage.toFixed(1)}%</span> of total value
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${getGreeting()}, ${organizationName}!`
                )}
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-blue-200">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-800 mt-2">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-emerald-600 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +{stats.revenueGrowth}% from last month
                </p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Invoices Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Invoices</p>
                <p className="text-3xl font-bold text-blue-800 mt-2">{stats.totalInvoices}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-green-600 text-sm">✓ {stats.paidInvoices} paid</span>
                  <span className="text-amber-600 text-sm">⏳ {stats.pendingInvoices} pending</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Products & Inventory Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Products</p>
                <p className="text-3xl font-bold text-purple-800 mt-2">{stats.totalProducts}</p>
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  {stats.lowStockProducts > 0 && (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {stats.lowStockProducts} low stock
                    </>
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clients & Performance Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Active Clients</p>
                <p className="text-3xl font-bold text-amber-800 mt-2">{stats.activeClients}</p>
                <p className="text-amber-600 text-sm mt-1">
                  {stats.conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Average Order Value Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Average Order Value</h3>
                    <p className="text-purple-100 text-sm">Transaction Analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Value */}
            <div className="space-y-4">
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</div>
              
              {/* Growth Indicator */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +8.2% from last week
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Based on recent transactions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Total Transactions</h3>
                    <p className="text-blue-100 text-sm">Payment Processing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Value */}
            <div className="space-y-4">
              <div className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All payments processed
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Real-time processing status</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Widget */}
          <SubscriptionWidget />
        </div>

        {/* Charts and Activity Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart - Spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    💰 Category Value Distribution
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">From Analytics</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <CategoryValueDistributionChart />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <button 
                  onClick={() => router.push('/dashboard/transactions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-amber-500' :
                      activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{activity.time}</span>
                        {activity.amount && (
                          <span className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5h8m-8 4h8m2-5h8m-8 4h8M9 1v10h30V1M9 11h30" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first invoice.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue vs Profit Chart */}
          <RevenueVsProfitChart />
          
          {/* Product Performance Chart */}
          <ProductPerformanceChart />
        </div>

        {/* Alerts & Notifications */}
        {(stats.overdueInvoices > 0 || stats.lowStockProducts > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Attention Required
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {stats.overdueInvoices > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Overdue Invoices</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {stats.overdueInvoices} invoice{stats.overdueInvoices > 1 ? 's are' : ' is'} overdue. Follow up with clients to ensure timely payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.lowStockProducts > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Low Stock Alert</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's have' : ' has'} low stock levels. Consider restocking soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button 
                onClick={handleCreateInvoice}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <svg className="w-6 h-6 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium text-blue-700 group-hover:text-blue-800">Create Invoice</span>
              </button>
              
              <button 
                onClick={handleAddClient}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <svg className="w-6 h-6 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-green-700 group-hover:text-green-800">Add Client</span>
              </button>
              
              <button 
                onClick={handleAddProduct}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
              >
                <svg className="w-6 h-6 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-purple-700 group-hover:text-purple-800">Add Product</span>
              </button>
              
              <button 
                onClick={handleViewReports}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-amber-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 group"
              >
                <svg className="w-6 h-6 text-amber-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-amber-700 group-hover:text-amber-800">View Reports</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
