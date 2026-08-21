'use client'

import { useState, useEffect } from 'react'
import { getSubscriptionStatus, cancelSubscription } from '@/services/paymentService'
import { formatPrice } from '@/lib/razorpay'

interface Subscription {
  id: string
  plan: {
    name: string
    price: number
  }
  status: string
  startDate: string
  endDate: string
  amount: number
  currency: string
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true)
      const response = await getSubscriptionStatus()
      
      if (response.success && response.subscription) {
        setSubscription(response.subscription)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      const response = await cancelSubscription()
      
      if (response.success) {
        setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : null)
        alert('Subscription cancelled successfully')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchSubscriptionStatus}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription. Choose a plan to get started.
        </p>
        <a
          href="/plans"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Plans
        </a>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'expired':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan:</span>
          <span className="font-medium">{subscription.plan.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium">{formatPrice(subscription.amount)} / month</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(subscription.status)}`}>
            {subscription.status.toUpperCase()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Start Date:</span>
          <span>{formatDate(subscription.startDate)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">End Date:</span>
          <span>{formatDate(subscription.endDate)}</span>
        </div>
      </div>
      
      {subscription.status === 'active' && (
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your subscription will remain active until the end date.
          </p>
        </div>
      )}
    </div>
  )
}
