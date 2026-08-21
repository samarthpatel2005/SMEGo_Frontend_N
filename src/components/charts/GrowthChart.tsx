'use client'

import React from 'react'

const GrowthChart: React.FC = () => {
  // Mock data for demonstration
  const data = [
    { quarter: 'Q1 2024', growth: 8.5 },
    { quarter: 'Q2 2024', growth: 12.3 },
    { quarter: 'Q3 2024', growth: 15.7 },
    { quarter: 'Q4 2024', growth: 18.9 }
  ]

  const maxGrowth = Math.max(...data.map(d => d.growth))

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Analytics</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{item.quarter}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-4 relative">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(item.growth / maxGrowth) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              {item.growth}%
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data[data.length - 1].growth}%
          </div>
          <div className="text-sm text-gray-600">Current Growth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {(data.reduce((sum, item) => sum + item.growth, 0) / data.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Average Growth</div>
        </div>
      </div>
    </div>
  )
}

export default GrowthChart
