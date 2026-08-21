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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { analyticsService, type ProductAnalytics, type DateRange } from '@/services/analyticsService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

interface ProductAnalyticsChartProps {
  dateRange?: DateRange
}

const ProductAnalyticsChart: React.FC<ProductAnalyticsChartProps> = ({ dateRange }) => {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'performance'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getProductAnalytics(dateRange)
      setAnalytics(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product analytics')
      console.error('Product analytics fetch error:', err)
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
          <p>Error loading product analytics: {error}</p>
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
        <p className="text-center text-gray-500">No product data available</p>
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-600">Total Products</h4>
          <p className="text-2xl font-bold text-blue-900">{analytics.totalProducts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-600">Active Products</h4>
          <p className="text-2xl font-bold text-green-900">{analytics.activeProducts}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-600">Low Stock</h4>
          <p className="text-2xl font-bold text-yellow-900">{analytics.lowStockProducts}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-600">Out of Stock</h4>
          <p className="text-2xl font-bold text-red-900">{analytics.outOfStockProducts}</p>
        </div>
      </div>

      {/* Detailed Inventory Value with Calculations */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Inventory Value Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-green-600 mb-2">Total Inventory Value</h5>
            <p className="text-2xl font-bold text-green-900">
              ${analytics.totalInventoryValue.toLocaleString()}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {analytics.calculationExplanations.totalInventoryValue.formula}
            </p>
            <p className="text-xs text-green-600 mt-1 font-mono">
              Total: ${analytics.totalInventoryValue.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-red-600 mb-2">Total Cost Value</h5>
            <p className="text-2xl font-bold text-red-900">
              ${analytics.totalCostValue.toLocaleString()}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {analytics.calculationExplanations.totalCostValue.formula}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-blue-600 mb-2">Potential Profit</h5>
            <p className="text-2xl font-bold text-blue-900">
              ${(analytics.totalInventoryValue - analytics.totalCostValue).toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Inventory Value - Cost Value
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Margin: {analytics.totalInventoryValue > 0 ?
                (((analytics.totalInventoryValue - analytics.totalCostValue) / analytics.totalInventoryValue) * 100).toFixed(2) : 0}%
            </p>
          </div>
        </div>

        {/* Average Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-purple-600 mb-2">Average Product Price</h5>
            <p className="text-xl font-bold text-purple-900">
              ${analytics.averageProductPrice.toFixed(2)}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {analytics.calculationExplanations.averageProductPrice.formula}
            </p>
            <p className="text-xs text-purple-600 mt-1 font-mono">
              {analytics.calculationExplanations.averageProductPrice.calculation}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-indigo-600 mb-2">Average Stock Value</h5>
            <p className="text-xl font-bold text-indigo-900">
              ${analytics.averageStockValue.toFixed(2)}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              {analytics.calculationExplanations.averageStockValue.formula}
            </p>
            <p className="text-xs text-indigo-600 mt-1 font-mono">
              {analytics.calculationExplanations.averageStockValue.calculation}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-orange-600 mb-2">Inventory Turnover Ratio</h5>
            <p className="text-xl font-bold text-orange-900">
              {analytics.inventoryTurnoverRatio.toFixed(2)}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              {analytics.calculationExplanations.inventoryTurnoverRatio.formula}
            </p>
            <p className="text-xs text-orange-600 mt-1 font-mono">
              {analytics.calculationExplanations.inventoryTurnoverRatio.calculation}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Distribution Analysis */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📦 Stock Distribution Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{analytics.stockAnalysis.stockDistribution.inStock}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">In Stock</p>
            <p className="text-xs text-gray-500">Above reorder point</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-yellow-600">{analytics.stockAnalysis.stockDistribution.lowStock}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Low Stock</p>
            <p className="text-xs text-gray-500">At or below reorder point</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-red-600">{analytics.stockAnalysis.stockDistribution.outOfStock}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Out of Stock</p>
            <p className="text-xs text-gray-500">Zero quantity</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{analytics.stockAnalysis.stockDistribution.overstocked}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Overstocked</p>
            <p className="text-xs text-gray-500">3x above reorder point</p>
          </div>
        </div>

        {/* Stock Value Distribution */}
        <div className="mt-6">
          <h5 className="text-md font-medium text-gray-700 mb-3">Value Distribution</h5>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'High Value (>$1000)', value: analytics.stockAnalysis.valueDistribution.highValue, fill: '#10B981' },
                  { name: 'Medium Value ($100-$1000)', value: analytics.stockAnalysis.valueDistribution.mediumValue, fill: '#F59E0B' },
                  { name: 'Low Value (<$100)', value: analytics.stockAnalysis.valueDistribution.lowValue, fill: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }: any) => `${name}: ${value}`}
              >
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Calculation Breakdown */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">🔍 Calculation Breakdown (Top 10 Products)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.inventoryCalculations.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${item.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${item.costPrice.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">${item.stockValue.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">${item.costValue.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${item.potentialProfit.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.profitMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Low Stock Items */}
      {analytics.lowStockItems.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h4 className="text-lg font-medium text-yellow-800 mb-3">⚠️ Low Stock Alert</h4>
          <div className="space-y-3">
            {analytics.lowStockItems.slice(0, 5).map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-white p-3 rounded border">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku} | Category: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Stock: <span className={`font-bold ${item.urgency === 'Critical' ? 'text-red-600' : item.urgency === 'High' ? 'text-orange-600' : 'text-yellow-600'}`}>{item.stock}</span></p>
                  <p className="text-xs text-gray-500">Reorder: {item.reorderPoint} | Value: ${item.stockValue.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${item.urgency === 'Critical' ? 'bg-red-100 text-red-800' : item.urgency === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Category Distribution Pie Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Product Distribution by Category</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analytics.categoryDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }: any) => `${category}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {analytics.categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Value Bar Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">💰 Category Value Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Total Value']} />
            <Legend />
            <Bar dataKey="totalValue" fill="#8884d8" name="Total Value" />
            <Bar dataKey="totalCost" fill="#82ca9d" name="Total Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Profitability Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📈 Category Profitability Analysis</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Potential Profit']} />
            <Legend />
            <Bar dataKey="potentialProfit" fill="#00C49F" name="Potential Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Stock vs Value Analysis */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Stock Quantity vs Value Analysis</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'totalQuantity') return [value, 'Total Stock'];
                if (name === 'totalValue') return [`$${value.toLocaleString()}`, 'Total Value'];
                if (name === 'averageValuePerProduct') return [`$${value.toFixed(2)}`, 'Avg Value/Product'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="totalValue" fill="#8884D8" name="Total Value" />
            <Bar yAxisId="right" dataKey="totalQuantity" fill="#82CA9D" name="Total Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Efficiency Matrix */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">🎯 Category Efficiency Matrix</h4>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={analytics.categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'averageValuePerProduct') return [`$${value.toFixed(2)}`, 'Avg Value per Product'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="averageValuePerProduct"
              stroke="#FF8042"
              fill="#FF8042"
              fillOpacity={0.6}
              name="Avg Value per Product"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Category Table */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📋 Category Performance Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value/Product</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.categoryDistribution.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.totalQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${category.totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${category.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ${category.potentialProfit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.profitMargin}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${category.averageValuePerProduct.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products per Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.categoryDistribution.slice(0, 6).map((category, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h5 className="font-medium text-gray-800 mb-3">{category.category} - Top Products</h5>
            <div className="space-y-2">
              {category.topProducts.map((product, pIndex) => (
                <div key={pIndex} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate">{product.name}</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Qty: {product.quantity}</div>
                    <div className="font-medium text-green-600">${product.value.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Top Products by Value Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">🏆 Top Products by Value</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.topProducts.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Total Value']} />
            <Legend />
            <Bar dataKey="totalValue" fill="#00C49F" name="Stock Value" />
            <Bar dataKey="totalCost" fill="#FF8042" name="Cost Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product Profitability Analysis */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">💹 Product Profitability Analysis</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.topProducts.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Potential Profit']} />
            <Legend />
            <Bar dataKey="potentialProfit" fill="#8884D8" name="Potential Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stock Status Distribution */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Stock Status Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                {
                  name: 'In Stock',
                  value: analytics.topProducts.filter(p => p.stockStatus === 'In Stock').length,
                  fill: '#10B981'
                },
                {
                  name: 'Low Stock',
                  value: analytics.topProducts.filter(p => p.stockStatus === 'Low Stock').length,
                  fill: '#F59E0B'
                },
                {
                  name: 'Out of Stock',
                  value: analytics.topProducts.filter(p => p.stockStatus === 'Out of Stock').length,
                  fill: '#EF4444'
                }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }: any) => `${name}: ${value}`}
            >
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Product Performance Table */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📋 Detailed Product Performance</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topProducts.slice(0, 15).map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.costPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${product.totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${product.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ${product.potentialProfit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.profitMargin}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' :
                        product.stockStatus === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {product.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg text-white">
          <h5 className="text-sm opacity-75">Highest Value Product</h5>
          <p className="text-lg font-bold">{analytics.topProducts[0]?.name || 'N/A'}</p>
          <p className="text-sm opacity-75">${analytics.topProducts[0]?.totalValue.toLocaleString() || '0'}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg text-white">
          <h5 className="text-sm opacity-75">Most Profitable Product</h5>
          <p className="text-lg font-bold">
            {analytics.topProducts.sort((a, b) => b.potentialProfit - a.potentialProfit)[0]?.name || 'N/A'}
          </p>
          <p className="text-sm opacity-75">
            ${analytics.topProducts.sort((a, b) => b.potentialProfit - a.potentialProfit)[0]?.potentialProfit.toLocaleString() || '0'} profit
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 rounded-lg text-white">
          <h5 className="text-sm opacity-75">Highest Margin Product</h5>
          <p className="text-lg font-bold">
            {analytics.topProducts.sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin))[0]?.name || 'N/A'}
          </p>
          <p className="text-sm opacity-75">
            {analytics.topProducts.sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin))[0]?.profitMargin || '0'}% margin
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-lg text-white">
          <h5 className="text-sm opacity-75">Largest Stock</h5>
          <p className="text-lg font-bold">
            {analytics.topProducts.sort((a, b) => b.stock - a.stock)[0]?.name || 'N/A'}
          </p>
          <p className="text-sm opacity-75">
            {analytics.topProducts.sort((a, b) => b.stock - a.stock)[0]?.stock || '0'} units
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Product Analytics</h3>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive analysis of your product inventory and performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'categories', name: 'Categories' },
            { id: 'performance', name: 'Performance' }
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
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
      </div>
    </div>
  )
}

export default ProductAnalyticsChart
