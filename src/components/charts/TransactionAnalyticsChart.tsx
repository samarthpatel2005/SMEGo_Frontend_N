'use client'

import React, { useState, useEffect } from 'react'
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { analyticsService, type TransactionAnalytics, type DateRange } from '@/services/analyticsService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

interface TransactionAnalyticsChartProps {
  dateRange?: DateRange
}

const TransactionAnalyticsChart: React.FC<TransactionAnalyticsChartProps> = ({ dateRange }) => {
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'products' | 'categories'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getTransactionAnalytics(dateRange)
      setAnalytics(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transaction analytics')
      console.error('Transaction analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center text-red-600">
          <p>Error loading transaction analytics: {error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <p className="text-center text-gray-500">No transaction data available</p>
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg text-white">
          <h4 className="text-sm opacity-75">Total Transactions</h4>
          <p className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</p>
          <p className="text-xs opacity-75">All time transactions</p>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg text-white">
          <h4 className="text-sm opacity-75">Total Revenue</h4>
          <p className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
          <p className="text-xs opacity-75">Gross revenue</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 rounded-lg text-white">
          <h4 className="text-sm opacity-75">Total Costs</h4>
          <p className="text-2xl font-bold">${analytics.totalCost.toLocaleString()}</p>
          <p className="text-xs opacity-75">Cost of goods sold</p>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-lg text-white">
          <h4 className="text-sm opacity-75">Net Profit</h4>
          <p className="text-2xl font-bold">${analytics.profit.toLocaleString()}</p>
          <p className="text-xs opacity-75">Revenue minus costs</p>
        </div>
      </div>

      {/* Enhanced Financial Breakdown */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">💰 Detailed Financial Breakdown</h4>

        {/* Main Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-green-600 mb-2">Revenue Analysis</h5>
            <p className="text-xl font-bold text-green-900">
              ${analytics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {analytics.financialCalculations.totalRevenue.formula}
            </p>
            <p className="text-xs text-green-600 mt-1 font-mono">
              ${analytics.financialCalculations.totalRevenue.value.toLocaleString()} from {analytics.financialCalculations.totalRevenue.totalTransactions} transactions
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-red-600 mb-2">Cost Analysis</h5>
            <p className="text-xl font-bold text-red-900">
              ${analytics.totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {analytics.financialCalculations.totalCost.formula}
            </p>
            <p className="text-xs text-red-600 mt-1 font-mono">
              ${analytics.financialCalculations.totalCost.value.toLocaleString()} from {analytics.financialCalculations.totalCost.totalTransactions} transactions
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-blue-600 mb-2">Profit Analysis</h5>
            <p className="text-xl font-bold text-blue-900">
              ${analytics.profit.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {analytics.financialCalculations.profit.formula}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-mono">
              {analytics.financialCalculations.profit.calculation}
            </p>
          </div>
        </div>

        {/* Profitability Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-purple-600 mb-2">Profit Margin</h5>
            <p className="text-xl font-bold text-purple-900">
              {analytics.profitMargin.toFixed(2)}%
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {analytics.financialCalculations.profitMargin.formula}
            </p>
            <p className="text-xs text-purple-600 mt-1 font-mono">
              {analytics.financialCalculations.profitMargin.calculation}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-indigo-600 mb-2">Average Transaction Value</h5>
            <p className="text-xl font-bold text-indigo-900">
              ${analytics.averageTransactionValue.toFixed(2)}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              {analytics.financialCalculations.averageTransactionValue.formula}
            </p>
            <p className="text-xs text-indigo-600 mt-1 font-mono">
              {analytics.financialCalculations.averageTransactionValue.calculation}
            </p>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-teal-600 mb-2">Average Order Size</h5>
            <p className="text-xl font-bold text-teal-900">
              {analytics.averageQuantityPerSale.toFixed(1)} items
            </p>
            <p className="text-xs text-teal-700 mt-1">
              {analytics.financialCalculations.averageQuantityPerSale.formula}
            </p>
            <p className="text-xs text-teal-600 mt-1 font-mono">
              {analytics.financialCalculations.averageQuantityPerSale.calculation}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue vs Cost vs Profit Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Revenue vs Cost vs Profit Analysis</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[
            {
              name: 'Financial Overview',
              revenue: analytics.totalRevenue,
              costs: analytics.totalCost,
              profit: analytics.profit
            }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any, name: string) => {
              const label = name === 'revenue' ? 'Revenue' :
                name === 'costs' ? 'Costs' : 'Net Profit';
              return [`$${value.toLocaleString()}`, label];
            }} />
            <Legend />
            <Bar dataKey="revenue" fill="#00C49F" name="Total Revenue" />
            <Bar dataKey="costs" fill="#FF8042" name="Total Costs" />
            <Bar dataKey="profit" fill="#8884D8" name="Net Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Performance Metrics */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">⚡ Transaction Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Revenue', value: analytics.totalRevenue, fill: '#00C49F' },
                    { name: 'Costs', value: analytics.totalCost, fill: '#FF8042' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }: any) => `${name}: $${value.toLocaleString()}`}
                />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Key Performance Indicators */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Cost Ratio</span>
              <span className="text-lg font-bold text-red-600">
                {((analytics.totalCost / analytics.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Revenue per Transaction</span>
              <span className="text-lg font-bold text-green-600">
                ${(analytics.totalRevenue / analytics.totalTransactions).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Profit per Transaction</span>
              <span className="text-lg font-bold text-blue-600">
                ${(analytics.profit / analytics.totalTransactions).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Break-even Point</span>
              <span className="text-lg font-bold text-purple-600">
                {analytics.totalCost > 0 ?
                  Math.ceil(analytics.totalCost / (analytics.totalRevenue / analytics.totalTransactions)) : 0
                } transactions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Monthly Revenue and Profit Trends */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Monthly Revenue & Profit Trends</h4>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={analytics.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value: any, name: any) => [`$${value.toLocaleString()}`, name]} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#00C49F" name="Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#FF8042" strokeWidth={3} name="Profit" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Sales vs Purchases */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales vs Purchases</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#00C49F" name="Sales Quantity" />
            <Bar dataKey="purchases" fill="#0088FE" name="Purchase Quantity" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderProductsTab = () => (
    <div className="space-y-6">
      {/* Top Performing Products Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Top Performing Products by Revenue</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.productPerformance.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Product Performance Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.productPerformance.slice(0, 10).map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.totalSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ${product.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${product.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    ${product.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.profitMargin.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Category Performance Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Category Performance by Revenue</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.categoryPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#8884D8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Category Performance Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.categoryPerformance.map((category) => (
                <tr key={category.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.totalSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ${category.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${category.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    ${category.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Transaction Analytics</h3>
        <p className="text-sm text-gray-600 mt-1">
          Detailed analysis of your sales, purchases, and financial performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'trends', name: 'Trends' },
            { id: 'products', name: 'Products' },
            { id: 'categories', name: 'Categories' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
      </div>
    </div>
  )
}

export default TransactionAnalyticsChart
