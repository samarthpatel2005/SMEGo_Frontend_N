'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/razorpay'
import { 
  getCurrentSubscription, 
  getPaymentHistory, 
  cancelSubscription,
  type SubscriptionData,
  type PaymentHistory 
} from '@/services/subscriptionService'
import DashboardShell from '@/components/layout/DashboardShell'
// Professional Icons (you can replace with your preferred icon library)
const Icons = {
  Check: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Receipt: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-2-2 2-2M5 20a2 2 0 01-2-2V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ExclamationTriangle: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.5 7.5L12 3l3.5 7.5L19 3v18H5V3z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [subscriptionData, paymentData] = await Promise.all([
        getCurrentSubscription().catch(err => {
          if (err.message?.includes('No active subscription found')) {
            return null;
          }
          throw err;
        }),
        getPaymentHistory(1, 10).catch(err => {
          return { payments: [], pagination: { currentPage: 1, totalPages: 0, totalPayments: 0, hasNext: false, hasPrev: false } };
        })
      ])

      setSubscription(subscriptionData)
      setPaymentHistory(paymentData.payments)
    } catch (error) {
      console.error('Error loading subscription data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200', 
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        glow: 'shadow-emerald-200'
      },
      inactive: { 
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200', 
        text: 'text-gray-700',
        dot: 'bg-gray-500',
        glow: 'shadow-gray-200'
      },
      cancelled: { 
        bg: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200', 
        text: 'text-red-700',
        dot: 'bg-red-500',
        glow: 'shadow-red-200'
      },
      expired: { 
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200', 
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        glow: 'shadow-amber-200'
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border shadow-lg ${config.bg} ${config.text} ${config.glow}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      success: { bg: 'bg-gradient-to-r from-emerald-100 to-green-100', text: 'text-emerald-800', icon: '✓', ring: 'ring-emerald-200' },
      failed: { bg: 'bg-gradient-to-r from-red-100 to-rose-100', text: 'text-red-800', icon: '✕', ring: 'ring-red-200' },
      pending: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-800', icon: '⏳', ring: 'ring-amber-200' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${config.bg} ${config.text} ${config.ring}`}>
        <span className="text-sm">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to premium features at the end of your current billing period.')) {
      return
    }

    try {
      setCancelling(true)
      await cancelSubscription()
      await loadSubscriptionData()
      alert('Subscription cancelled successfully. You will retain access until the end of your current billing period.')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center bg-white rounded-3xl shadow-2xl border border-white/20 p-12 backdrop-blur-sm">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto opacity-20"></div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                Loading Subscription Details
              </h3>
              <p className="text-slate-600 text-lg">Please wait while we fetch your subscription information...</p>
            </div>
          </div>
        </div>
      </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-12 max-w-md w-full text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50">
                <Icons.ExclamationTriangle />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
              <button 
                onClick={loadSubscriptionData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Icons.Refresh />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icons.Crown />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Subscription Management
                  </h1>
                  <p className="text-slate-600 text-lg mt-1">Monitor your subscription, billing, and usage details</p>
                </div>
              </div>
              <button
                onClick={loadSubscriptionData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                <Icons.Refresh />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {subscription ? (
          <>
            {/* Subscription Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {/* Plan Info Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                      <Icons.CreditCard />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Current Plan</h3>
                      <p className="text-sm text-gray-600 font-medium">Active subscription</p>
                    </div>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {subscription.planDisplayName}
                    </p>
                    <p className="text-xl font-semibold text-gray-700 mt-1">
                        {formatPrice(subscription.price / 100, subscription.currency)}
                      <span className="text-sm text-gray-500 font-normal">/{subscription.interval}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Billing Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-lg">
                    <Icons.Calendar />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Next Billing</h3>
                    <p className="text-sm text-gray-600 font-medium">Automatic renewal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 font-medium">
                    Started: {formatDate(subscription.startDate)}
                  </p>
                </div>
              </div>

              {/* Usage Overview Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-200 rounded-xl flex items-center justify-center shadow-lg">
                    <Icons.Users />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Plan Limits</h3>
                    <p className="text-sm text-gray-600 font-medium">Current allowances</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-700">{subscription.limits.employees}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-1">Employees</p>
                  </div>
                  <div className="text-center bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-700">{subscription.limits.clients}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">Clients</p>
                  </div>
                  <div className="text-center bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-700">{subscription.limits.invoices === -1 ? '∞' : subscription.limits.invoices}</p>
                    <p className="text-xs text-purple-600 font-semibold mt-1">Invoices</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Subscription Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 mb-10 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900 p-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Icons.Sparkles />
                  Subscription Details
                </h2>
                <p className="text-slate-300 text-lg mt-2">Everything you need to know about your current plan</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Plan Features */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Icons.Check />
                      </div>
                      Included Features
                    </h3>
                    <div className="space-y-4">
                      {subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Icons.Check />
                          </div>
                          <span className="text-gray-800 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Icons.Building />
                      </div>
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                        <span className="text-gray-700 font-medium">Plan Type</span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">{subscription.planDisplayName}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <span className="text-gray-700 font-medium">Billing Cycle</span>
                        <span className="font-bold text-blue-900 bg-white px-3 py-1 rounded-lg shadow-sm capitalize">{subscription.interval}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <span className="text-gray-700 font-medium">Status</span>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                        <span className="text-gray-700 font-medium">Currency</span>
                        <span className="font-bold text-amber-900 bg-white px-3 py-1 rounded-lg shadow-sm">{subscription.currency.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Subscription State */
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 mb-10 overflow-hidden">
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Icons.Crown />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-4">
                No Active Subscription
              </h2>
              <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                You don't have an active subscription yet. Choose from our flexible plans to unlock premium features and grow your business to new heights.
              </p>
              <button
                onClick={() => router.push('/plans')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <Icons.Sparkles />
                View Plans
              </button>
            </div>
          </div>
        )}

        {/* Payment History Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icons.Receipt />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Payment History</h2>
                  <p className="text-indigo-100 text-lg mt-1">Track all your subscription payments</p>
                </div>
              </div>
              {paymentHistory.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white font-semibold">{paymentHistory.length} transactions</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Icons.Receipt />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Payment History</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">Your payment transactions will appear here once you make a purchase.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paymentHistory.map((payment, index) => (
                        <tr key={payment.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="text-sm font-semibold text-gray-900 bg-slate-100 px-3 py-1 rounded-lg">
                                {formatDate(payment.date)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatPrice(payment.amount, payment.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-xl border border-purple-200">
                              <Icons.CreditCard />
                              <span className="text-sm font-semibold text-purple-800 capitalize">{payment.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {getPaymentStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded-lg border">
                              {payment.razorpayPaymentId || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardShell>
  )
}