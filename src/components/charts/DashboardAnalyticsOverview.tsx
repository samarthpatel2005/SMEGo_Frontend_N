'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts'
import { analyticsService, type DashboardAnalytics, type DateRange } from '@/services/analyticsService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface DashboardAnalyticsProps {
  dateRange?: DateRange
}

const DashboardAnalyticsOverview: React.FC<DashboardAnalyticsProps> = ({ dateRange }) => {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getDashboardAnalytics(dateRange)
      console.log('Dashboard Analytics Response:', response.data) // Debug log
      console.log('Transaction Breakdown:', response.data?.transactionBreakdown) // Debug log
      setAnalytics(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard analytics')
      console.error('Dashboard analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Navigation handlers
  const handleProductAnalytics = () => {
    router.push('/dashboard/products')
  }

  const handleTransactionAnalytics = () => {
    router.push('/dashboard/transactions')
  }

  const handleExportReports = () => {
    // Navigate to analytics page for now, or implement export functionality
    router.push('/dashboard/analytics')
  }

  // Safe helper functions to handle potentially undefined data
  const getRevenue = () => Number(analytics?.summary?.currentMonthRevenue || 0)
  const getProfit = () => Number(analytics?.summary?.currentMonthProfit || 0)
  const getProductsCreated = () => Number(analytics?.summary?.totalProductsCreated || 0)
  const getTransactionsCompleted = () => Number(analytics?.summary?.totalTransactionsCompleted || 0)
  const getLowStockAlerts = () => Number(analytics?.summary?.lowStockAlerts || 0)
  const getTopCategory = () => String(analytics?.summary?.topSellingCategory || 'N/A')
  const getInventoryTurnover = () => Number(analytics?.summary?.inventoryTurnover || 0)
  const getTotalProducts = () => Number(analytics?.products?.totalProducts || 0)
  const getOrganizationId = () => {
    const orgId = analytics?.summary?.organizationId
    if (typeof orgId === 'string') return orgId
    if (orgId && typeof orgId === 'object') {
      // Extract just the _id or orgId from the organization object
      const orgObj = orgId as any
      return orgObj._id || orgObj.orgId || orgObj.id || 'Unknown ID'
    }
    return 'Loading...'
  }
  const getTransactionBreakdown = () => analytics?.transactionBreakdown || {}

  const getAverageTransactionValue = () => {
    const transactions = getTransactionsCompleted()
    const revenue = getRevenue()
    return transactions > 0 ? revenue / transactions : 0
  }
  const getProfitMargin = () => {
    const revenue = getRevenue()
    const profit = getProfit()
    return revenue > 0 ? (profit / revenue) * 100 : 0
  }

  // Dynamic calculation helpers
  const getSalesBreakdownText = () => {
    const breakdown = getTransactionBreakdown()
    const entries = Object.entries(breakdown)
    if (entries.length === 0) return "No sales data available"

    const breakdownText = entries.slice(0, 3).map(([product, data]) =>
      `${String(product)}: ${Number(data.quantity)} units × $${Number(data.unitPrice)} = $${Number(data.revenue).toLocaleString()}`
    ).join(" + ")

    const total = entries.reduce((sum, [, data]) => sum + Number(data.revenue), 0)
    return `${breakdownText} = $${total.toLocaleString()}`
  }

  const getCostBreakdownText = () => {
    const breakdown = getTransactionBreakdown()
    const entries = Object.entries(breakdown)
    if (entries.length === 0) return "No cost data available"

    return entries.slice(0, 3).map(([product, data]) =>
      `${String(product)}: ${Number(data.quantity)} units × $${Number(data.unitCost)} = $${Number(data.cost).toLocaleString()}`
    ).join(" + ")
  }

  const getRealSalesBreakdown = () => {
    const breakdown = getTransactionBreakdown()
    if (!breakdown || Object.keys(breakdown).length === 0) return []

    return Object.entries(breakdown).map(([product, data]) => ({
      product: String(product || 'Unknown Product'),
      quantity: Number(data?.quantity || 0),
      unitPrice: Number(data?.unitPrice || 0),
      revenue: Number(data?.revenue || 0)
    }))
  }

  const getRealCostBreakdown = () => {
    const breakdown = getTransactionBreakdown()
    if (!breakdown || Object.keys(breakdown).length === 0) return []

    return Object.entries(breakdown).map(([product, data]) => ({
      product: String(product || 'Unknown Product'),
      quantity: Number(data?.quantity || 0),
      unitCost: Number(data?.unitCost || 0),
      cost: Number(data?.cost || 0)
    }))
  }

  const getRealProfitBreakdown = () => {
    const breakdown = getTransactionBreakdown()
    if (!breakdown || Object.keys(breakdown).length === 0) return []

    return Object.entries(breakdown).map(([product, data]) => ({
      product: String(product || 'Unknown Product'),
      profit: Number(data?.profit || 0),
      margin: Number(data?.revenue || 0) > 0 ? ((Number(data?.profit || 0) / Number(data?.revenue || 0)) * 100).toFixed(1) : '0'
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Enhanced loading state with shimmer effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart loading states */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Analytics Unavailable</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reload Analytics
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600">Start by adding products and recording transactions to see your analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-80">Revenue</div>
                <div className="text-xs opacity-60">This Month</div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">${getRevenue().toLocaleString()}</div>
            <div className="flex items-center text-sm opacity-80">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              +{getProfitMargin().toFixed(1)}% margin
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-80">Profit</div>
                <div className="text-xs opacity-60">Net Income</div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">${getProfit().toLocaleString()}</div>
            <div className="flex items-center text-sm opacity-80">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              {getProfitMargin().toFixed(1)}% margin
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-80">Transactions</div>
                <div className="text-xs opacity-60">Total Count</div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{getTransactionsCompleted()}</div>
            <div className="flex items-center text-sm opacity-80">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              ${getAverageTransactionValue().toLocaleString()} avg
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-80">Products</div>
                <div className="text-xs opacity-60">In Catalog</div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{getTotalProducts()}</div>
            <div className="flex items-center text-sm opacity-80">
              {getLowStockAlerts() > 0 ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {getLowStockAlerts()} low stock
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  All stocked
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional SaaS Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Low Stock Alerts</h4>
              <p className="text-2xl font-bold text-yellow-600">{getLowStockAlerts()}</p>
              <p className="text-xs text-gray-500">Products need reordering</p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Top Category</h4>
              <p className="text-lg font-bold text-blue-600">{getTopCategory()}</p>
              <p className="text-xs text-gray-500">Best performing</p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Inventory Turnover</h4>
              <p className="text-2xl font-bold text-green-600">{getInventoryTurnover().toFixed(2)}</p>
              <p className="text-xs text-gray-500">Times per period</p>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Avg Transaction</h4>
              <p className="text-lg font-bold text-purple-600">${getAverageTransactionValue().toFixed(2)}</p>
              <p className="text-xs text-gray-500">Per transaction</p>
            </div>
            <div className="text-2xl">💵</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Profit Margin</h4>
              <p className="text-2xl font-bold text-indigo-600">{getProfitMargin().toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Overall margin</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Total Products</h4>
              <p className="text-2xl font-bold text-gray-800">{getTotalProducts()}</p>
              <p className="text-xs text-gray-500">In inventory</p>
            </div>
            <div className="text-2xl">📦</div>
          </div>
        </div>
      </div>

      {/* Business Health Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 Business Health Dashboard</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Financial Health */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-3">💰 Financial Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Revenue</span>
                <span className="text-sm font-bold text-green-800">${getRevenue().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Profit</span>
                <span className="text-sm font-bold text-green-800">${getProfit().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Margin</span>
                <span className="text-sm font-bold text-green-800">{getProfitMargin().toFixed(1)}%</span>
              </div>
              <div className="mt-2 bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, getProfitMargin() * 2)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Operational Health */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-3">⚙️ Operational Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Products</span>
                <span className="text-sm font-bold text-blue-800">{getTotalProducts()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Transactions</span>
                <span className="text-sm font-bold text-blue-800">{getTransactionsCompleted()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Avg/Transaction</span>
                <span className="text-sm font-bold text-blue-800">${getAverageTransactionValue().toFixed(0)}</span>
              </div>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (getTransactionsCompleted() / Math.max(1, getTotalProducts())) * 50)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Inventory Health */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-3">📦 Inventory Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-purple-600">Total Products</span>
                <span className="text-sm font-bold text-purple-800">{getTotalProducts()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-purple-600">Low Stock</span>
                <span className="text-sm font-bold text-purple-800">{getLowStockAlerts()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-purple-600">Turnover</span>
                <span className="text-sm font-bold text-purple-800">{getInventoryTurnover().toFixed(1)}x</span>
              </div>
              <div className="mt-2 bg-purple-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (getLowStockAlerts() / Math.max(1, getTotalProducts())) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Growth Indicators */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <h4 className="text-sm font-medium text-orange-800 mb-3">📈 Growth Indicators</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-orange-600">New Products</span>
                <span className="text-sm font-bold text-orange-800">{getProductsCreated()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-orange-600">Activity Level</span>
                <span className="text-sm font-bold text-orange-800">
                  {getTransactionsCompleted() > 0 ? 'Active' : 'Starting'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-orange-600">Top Category</span>
                <span className="text-sm font-bold text-orange-800">{getTopCategory()}</span>
              </div>
              <div className="mt-2 bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (getProductsCreated() / Math.max(1, getTotalProducts())) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Insights Alert */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="text-sm font-medium text-yellow-800 mb-2">⚡ Quick Insights</h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Revenue efficiency: ${(getRevenue() / Math.max(1, getTransactionsCompleted())).toFixed(2)} per transaction</li>
              <li>• Inventory utilization: {getTotalProducts() > 0 ? ((getTotalProducts() - getLowStockAlerts()) / getTotalProducts() * 100).toFixed(1) : 0}% well-stocked</li>
              <li>• Growth rate: {getProductsCreated()} new products this period</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-2">🎯 Recommendations</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              {getProfitMargin() < 15 && (
                <li>• Consider reviewing cost structure to improve profit margins</li>
              )}
              {getLowStockAlerts() > 0 && (
                <li>• {getLowStockAlerts()} products need reordering attention</li>
              )}
              {getTransactionsCompleted() === 0 && (
                <li>• Start recording transactions to track business performance</li>
              )}
              {getTransactionsCompleted() > 0 && getProfitMargin() > 20 && (
                <li>• Excellent profit margins! Consider scaling operations</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts Section Header */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Advanced Analytics & Insights</h2>
        <p className="text-gray-600">Comprehensive business intelligence at a glance</p>
      </div>

      {/* Modern Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Revenue vs Profit</h3>
              <p className="text-sm text-gray-600">Financial performance overview</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { name: 'Current Month', revenue: getRevenue(), profit: getProfit(), margin: getProfitMargin() }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
                <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={3} name="Margin %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Product Performance</h3>
              <p className="text-sm text-gray-600">Revenue distribution by product</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(getTransactionBreakdown()).map(([product, data], index) => ({
                    name: product,
                    value: Number((data as any).revenue || 0),
                    fill: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
                >
                  {Object.entries(getTransactionBreakdown()).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Quantity Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Sales</h3>
              <p className="text-sm text-gray-600">Quantity sold by product</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(getTransactionBreakdown()).map(([product, data]) => ({
                name: product.length > 8 ? product.substring(0, 8) + '...' : product,
                quantity: Number((data as any).quantity || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="quantity" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Margin by Product */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profit Analysis</h3>
              <p className="text-sm text-gray-600">Profit by product</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Object.entries(getTransactionBreakdown()).map(([product, data]) => ({
                name: product.length > 8 ? product.substring(0, 8) + '...' : product,
                profit: Number((data as any).profit || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Profit']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" />
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
              <p className="text-sm text-gray-600">Cost breakdown by product</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3-3-3h6m6 0a3 3 0 11-6 0"></path>
              </svg>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.entries(getTransactionBreakdown()).map(([product, data]) => ({
                name: product.length > 8 ? product.substring(0, 8) + '...' : product,
                cost: Number((data as any).cost || 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Cost']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="cost" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Calculation Explanations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🧮 How Values Are Calculated</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800 mb-3">📊 Financial Metrics</h4>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Monthly Revenue</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> Sum of (Quantity Sold × Product Price) for all sales transactions in current month
              </p>
              <p className="text-xs text-blue-600">
                <strong>Value:</strong> ${getRevenue().toLocaleString()}
                {getTransactionsCompleted() > 0 && (
                  <span> (from {getTransactionsCompleted()} transactions)</span>
                )}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Monthly Profit</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> Revenue - Cost of Goods Sold (COGS)
              </p>
              <p className="text-xs text-blue-600">
                <strong>Calculation:</strong> ${getRevenue().toLocaleString()} (revenue) - estimated COGS = ${getProfit().toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Profit Margin</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> (Profit ÷ Revenue) × 100
              </p>
              <p className="text-xs text-blue-600">
                <strong>Calculation:</strong> {getRevenue() > 0 ?
                  `(${getProfit().toLocaleString()} ÷ ${getRevenue().toLocaleString()}) × 100 = ${getProfitMargin().toFixed(1)}%` :
                  'No revenue yet to calculate margin'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Average Transaction Value</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> Total Revenue ÷ Number of Transactions
              </p>
              <p className="text-xs text-blue-600">
                <strong>Calculation:</strong> {getTransactionsCompleted() > 0 ?
                  `${getRevenue().toLocaleString()} ÷ ${getTransactionsCompleted()} = $${getAverageTransactionValue().toFixed(2)}` :
                  'No transactions yet'
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800 mb-3">📦 Inventory Metrics</h4>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Inventory Turnover</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> Total Inventory Value ÷ Total Cost Value
              </p>
              <p className="text-xs text-blue-600">
                <strong>Note:</strong> Shows how efficiently inventory is being utilized (higher = better)
              </p>
              <p className="text-xs text-blue-600">
                <strong>Value:</strong> {getInventoryTurnover().toFixed(2)}x turnover ratio
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Low Stock Alerts</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Formula:</strong> Count of products where Current Stock ≤ Reorder Point
              </p>
              <p className="text-xs text-blue-600">
                <strong>Value:</strong> {getLowStockAlerts()} products need attention
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Top Selling Category</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Method:</strong> Category with highest total quantity sold in this period
              </p>
              <p className="text-xs text-blue-600">
                <strong>Value:</strong> {getTopCategory()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Products Created</h5>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Method:</strong> Count of products created within the selected time period
              </p>
              <p className="text-xs text-blue-600">
                <strong>Value:</strong> {getProductsCreated()} new products this period
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">🔍 Data Sources & Organization Filtering</h4>
          <div className="text-xs text-indigo-700 space-y-1">
            <p><strong>Data Sources:</strong> All calculations use data from your organization&apos;s products, transactions, and inventory records.</p>
            <p><strong>Organization Filtering:</strong> Backend automatically filters all data by req.user.organization to ensure complete data isolation.</p>
            <p><strong>Real-time Updates:</strong> Metrics update automatically as you add new products, record transactions, or update inventory.</p>
            <p><strong>Period-based:</strong> Most metrics can be filtered by time period (current month, quarter, custom range).</p>
          </div>
        </div>
      </div>

      {/* Revenue & Profit Calculation Explanation */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">🧮</div>
          <h3 className="text-lg font-semibold text-gray-900">How We Calculate Your Numbers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
              <span>📊</span>
              Monthly Revenue: ${getRevenue().toLocaleString()}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Formula:</strong> Sum of (Quantity × Product Price) for all SALE transactions this month
            </p>
            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
              <div>• Only counts "sale" type transactions</div>
              <div>• Filtered by your organization only</div>
              <div>• Current month: August 2025</div>
              <div>• Your calculation: {getSalesBreakdownText()}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
              <span>💰</span>
              Monthly Profit: ${getProfit().toLocaleString()}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Formula:</strong> Revenue - Cost of Goods Sold (COGS)
            </p>
            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
              <div>• Revenue: Quantity × Selling Price</div>
              <div>• COGS: Quantity × Cost Price</div>
              <div>• Profit = Revenue - COGS</div>
              <div>• Your calculation: ${getRevenue().toLocaleString()} revenue - ${(getRevenue() - getProfit()).toLocaleString()} cost = ${getProfit().toLocaleString()} profit</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border">
            <h5 className="text-sm font-medium text-gray-700 mb-1">📦 Your Sales Breakdown</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {getRealSalesBreakdown().length > 0 ? (
                <>
                  {getRealSalesBreakdown().map((item, index) => (
                    <div key={index}>• {item.product}: {item.quantity} units × ${item.unitPrice} = ${item.revenue.toLocaleString()}</div>
                  ))}
                  <div className="font-medium border-t pt-1">Total: ${getRevenue().toLocaleString()}</div>
                </>
              ) : (
                <div className="text-gray-400">No sales data for this period</div>
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded border">
            <h5 className="text-sm font-medium text-gray-700 mb-1">💸 Your Cost Breakdown</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {getRealCostBreakdown().length > 0 ? (
                <>
                  {getRealCostBreakdown().map((item, index) => (
                    <div key={index}>• {item.product}: {item.quantity} units × ${item.unitCost} = ${item.cost.toLocaleString()}</div>
                  ))}
                  <div className="font-medium border-t pt-1">Total: ${(getRevenue() - getProfit()).toLocaleString()}</div>
                </>
              ) : (
                <div className="text-gray-400">No cost data for this period</div>
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded border">
            <h5 className="text-sm font-medium text-gray-700 mb-1">📈 Your Profit Analysis</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {getRealProfitBreakdown().length > 0 ? (
                <>
                  {getRealProfitBreakdown().map((item, index) => (
                    <div key={index} className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      • {item.product} profit: ${item.profit.toLocaleString()} ({item.margin}% margin)
                    </div>
                  ))}
                  <div className={`font-medium border-t pt-1 ${getProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net Profit: ${getProfit().toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No profit data for this period</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAnalyticsOverview
