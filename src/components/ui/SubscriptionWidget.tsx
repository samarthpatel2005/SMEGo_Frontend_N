'use client'

import { formatPrice } from '@/lib/razorpay'
import { getCurrentSubscription, type SubscriptionData } from '@/services/subscriptionService'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SubscriptionWidget() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const data = await getCurrentSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Error loading subscription:', error)
      setError('Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border border-red-200'
      case 'expired': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Plan</h3>
          <p className="text-gray-600 mb-6 text-sm">
            {error ? 'Error loading subscription' : 'No active subscription found'}
          </p>
          <Link 
            href="/plans"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
          >
            Choose Plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 mb-6 text-white">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Plan</h3>
              <p className="text-emerald-100 text-sm">Active Subscription</p>
            </div>
          </div>
          <Link 
            href="/dashboard/subscription"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <span>Manage</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{subscription.planDisplayName}</div>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold text-gray-700">
              {formatPrice(subscription.price / 100, subscription.currency)}/{subscription.interval}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status.toUpperCase()}
            </span>
          </div>
        </div>

        {subscription.nextBillingDate && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">
                Next billing: {formatDate(subscription.nextBillingDate)}
              </span>
            </div>
          </div>
        )}

        {/* Limits Section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Limits</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{subscription.limits.employees}</div>
              <div className="text-xs text-blue-600 font-medium">Employees</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{subscription.limits.clients}</div>
              <div className="text-xs text-purple-600 font-medium">Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
