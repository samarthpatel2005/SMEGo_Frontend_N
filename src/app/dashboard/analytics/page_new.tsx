'use client'

import React, { useState } from 'react'
import ProductAnalyticsChart from '@/components/charts/ProductAnalyticsChart'
import TransactionAnalyticsChart from '@/components/charts/TransactionAnalyticsChart'
import DashboardAnalyticsOverview from '@/components/charts/DashboardAnalyticsOverview'
import { type DateRange } from '@/services/analyticsService'

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ period: 'month' })
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'transactions'>('overview')

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  const renderDateRangeSelector = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={dateRange.period || 'month'}
            onChange={(e) => handleDateRangeChange({ period: e.target.value as any })}
            className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange.period === 'custom' && (
          <>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => handleDateRangeChange({ ...dateRange, startDate: e.target.value })}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => handleDateRangeChange({ ...dateRange, endDate: e.target.value })}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </>
        )}

        <button
          onClick={() => handleDateRangeChange({ period: 'month' })}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset to Current Month
        </button>
      </div>
    </div>
  )

  const renderViewSelector = () => (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Analytics Views">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'products', name: 'Products', icon: '📦' },
            { id: 'transactions', name: 'Transactions', icon: '💼' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeView === view.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span>{view.icon}</span>
              <span>{view.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of your organization&apos;s products, transactions, and business performance
          </p>
        </div>

        {/* Date Range Selector */}
        {renderDateRangeSelector()}

        {/* View Selector */}
        {renderViewSelector()}

        {/* Content */}
        <div className="space-y-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              <DashboardAnalyticsOverview dateRange={dateRange} />

              {/* Quick stats summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveView('products')}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">📦 View Product Analytics</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Analyze inventory, categories, and product performance
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveView('transactions')}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">💼 View Transaction Analytics</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Track sales, purchases, and financial trends
                    </p>
                  </button>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900">📈 Export Reports</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Coming soon: Download detailed analytics reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'products' && (
            <ProductAnalyticsChart dateRange={dateRange} />
          )}

          {activeView === 'transactions' && (
            <TransactionAnalyticsChart dateRange={dateRange} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📈 Organization-Specific Analytics</h3>
          <p className="text-blue-800">
            All analytics data shown here is specific to your organization. Products, transactions, and financial data
            are automatically filtered to show only your organization&apos;s information, ensuring data privacy and accuracy.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <strong className="text-blue-900">🔒 Data Privacy:</strong>
              <p className="text-blue-700">Only your organization&apos;s data is accessible</p>
            </div>
            <div className="bg-white p-3 rounded">
              <strong className="text-blue-900">📊 Real-time Updates:</strong>
              <p className="text-blue-700">Analytics update automatically with new transactions</p>
            </div>
            <div className="bg-white p-3 rounded">
              <strong className="text-blue-900">🎯 Accurate Insights:</strong>
              <p className="text-blue-700">All calculations based on your specific business data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
