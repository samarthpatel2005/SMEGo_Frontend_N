'use client'

import React, { useState, useEffect } from 'react'
import { analyticsService, type ProductAnalytics, type TransactionAnalytics, type DashboardAnalytics } from '@/services/analyticsService'

/**
 * Example Component: How to Use Analytics in Any Page
 * 
 * This demonstrates how to integrate organization-specific analytics
 * into any component or page in your application.
 */

const ExampleAnalyticsUsage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [productData, setProductData] = useState<ProductAnalytics | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Example: Fetch analytics data for current month
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch different types of analytics
      const [dashboardResponse, productResponse, transactionResponse] = await Promise.all([
        analyticsService.getDashboardAnalytics({ period: 'month' }),
        analyticsService.getProductAnalytics({ period: 'month' }),
        analyticsService.getTransactionAnalytics({ period: 'month' })
      ])

      setDashboardData(dashboardResponse.data)
      setProductData(productResponse.data)
      setTransactionData(transactionResponse.data)

    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {error}
        <button
          onClick={fetchAnalyticsData}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Integration Example</h2>

      {/* Dashboard Summary */}
      {dashboardData?.summary && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Dashboard Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.summary.totalProductsCreated}</p>
              <p className="text-sm text-gray-600">Products Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{dashboardData.summary.totalTransactionsCompleted}</p>
              <p className="text-sm text-gray-600">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">${dashboardData.summary.currentMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${dashboardData.summary.currentMonthProfit.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly Profit</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Analytics Summary */}
      {productData && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Product Analytics Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{productData.totalProducts}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{productData.activeProducts}</p>
              <p className="text-sm text-gray-600">Active Products</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">{productData.lowStockProducts}</p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{productData.outOfStockProducts}</p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>

          {/* Top Categories */}
          {productData.categoryDistribution.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Top Categories</h4>
              <div className="space-y-1">
                {productData.categoryDistribution.slice(0, 3).map((category) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category.category}</span>
                    <span className="text-sm font-medium">{category.count} products</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Analytics Summary */}
      {transactionData && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Transaction Analytics Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{transactionData.totalTransactions}</p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{transactionData.totalSales}</p>
              <p className="text-sm text-gray-600">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-600">${transactionData.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-600">{transactionData.profitMargin.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Profit Margin</p>
            </div>
          </div>

          {/* Top Performing Products */}
          {transactionData.productPerformance.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Top Performing Products</h4>
              <div className="space-y-1">
                {transactionData.productPerformance.slice(0, 3).map((product) => (
                  <div key={product.productId} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{product.productName}</span>
                    <span className="text-sm font-medium">${product.totalRevenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Examples Code */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">How to Use This in Your Components</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800">1. Import the analytics service:</h4>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
              {`import { analyticsService } from '@/services/analyticsService'`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800">2. Fetch analytics data:</h4>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
              {`const response = await analyticsService.getProductAnalytics({ period: 'month' })`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800">3. Use different date ranges:</h4>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
              {`// This week: { period: 'week' }\n// Custom range: { period: 'custom', startDate: '2025-01-01', endDate: '2025-01-31' }`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800">4. Available analytics endpoints:</h4>
            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
              <li>analyticsService.getProductAnalytics() - Product inventory and performance</li>
              <li>analyticsService.getTransactionAnalytics() - Sales and purchase analysis</li>
              <li>analyticsService.getDashboardAnalytics() - Combined overview</li>
              <li>analyticsService.getInventoryAnalytics() - Inventory valuation</li>
              <li>analyticsService.getRevenueAnalytics() - Revenue trends</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Organization-specific Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔒 Organization-Specific Data</h4>
        <p className="text-blue-800 text-sm">
          All analytics automatically filter data based on the authenticated user&apos;s organization.
          This ensures that each organization only sees their own products, transactions, and financial data.
        </p>
      </div>
    </div>
  )
}

export default ExampleAnalyticsUsage
