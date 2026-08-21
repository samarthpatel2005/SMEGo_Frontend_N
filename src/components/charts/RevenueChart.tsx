'use client'

import React, { useState, useEffect } from 'react'

const RevenueChart: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  
  // Mock data for demonstration
  const data = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 }
  ]

  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // Fix hydration issue by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simple number formatting to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
              style={{
                height: `${(item.revenue / maxRevenue) * 200}px`,
                minHeight: '10px'
              }}
              title={mounted ? `${item.month}: ${formatNumber(item.revenue)}` : `${item.month}: $${item.revenue}`}
            />
            <span className="text-xs text-gray-600 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Total Revenue: {mounted ? formatNumber(totalRevenue) : `$${totalRevenue}`}</p>
      </div>
    </div>
  )
}

export default RevenueChart
