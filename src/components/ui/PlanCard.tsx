'use client'

import { useState } from 'react'
import { initiateRazorpayPayment, verifyRazorpayPayment, formatPrice } from '@/lib/razorpay'

interface PlanCardProps {
  planId: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  currency?: string
  interval?: string
  onPaymentSuccess?: () => void
  // Registration flow props
  isSelected?: boolean
  onSelect?: () => void
  selectionMode?: boolean
}

export default function PlanCard({ 
  planId, 
  name, 
  price, 
  description, 
  features, 
  popular = false,
  currency = 'INR',
  interval = 'month',
  onPaymentSuccess,
  isSelected = false,
  onSelect,
  selectionMode = false
}: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Handle free plan
      if (price === 0) {
        alert('Free plan activated!')
        onPaymentSuccess?.()
        return
      }

      // Get user details from localStorage (set after OTP verification)
      const adminData = localStorage.getItem('admin')
      const orgData = localStorage.getItem('organization')
      
      let userDetails = {
        name: 'User Name',
        email: 'user@example.com',
        contact: '+919999999999'
      }

      // Use actual user data if available
      if (adminData) {
        try {
          const admin = JSON.parse(adminData)
          userDetails = {
            name: admin.fullName || admin.name || 'User Name',
            email: admin.email || admin.workEmail || 'user@example.com',
            contact: admin.phone || '+919999999999'
          }
        } catch (e) {
          console.warn('Failed to parse admin data from localStorage')
        }
      }

      // Initiate Razorpay payment
      const paymentResponse = await initiateRazorpayPayment(planId, userDetails, true) // true for registration

      // Verify payment on server
      const verificationResult = await verifyRazorpayPayment(paymentResponse, planId, true) // true for registration

      if (verificationResult.success) {
        onPaymentSuccess?.()
        alert('Subscription activated successfully!')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    if (selectionMode && onSelect) {
      onSelect()
    } else {
      handleSubscribe()
    }
  }

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected ? 'border-2 border-blue-600 ring-2 ring-blue-200' : popular ? 'border-2 border-blue-500' : 'border border-gray-200'}
        hover:shadow-2xl hover:border-blue-400`
      }
      onClick={selectionMode && onSelect ? onSelect : undefined}
      style={{ minWidth: 320, maxWidth: 400 }}
    >
      {/* Popular Badge */}
      {popular && !isSelected && (
        <div className="absolute top-6 left-6">
          <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute top-6 right-6">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="flex flex-col items-center px-8 pt-10 pb-6">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
          {name}
        </h3>
        <p className="text-base text-gray-500 mb-4 text-center min-h-[40px]">{description}</p>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-extrabold text-blue-700">{formatPrice(price, currency)}</span>
          <span className="text-gray-500 text-lg font-medium">/{interval}</span>
        </div>
        <div className="w-full border-t border-gray-200 my-4" />
        <ul className="w-full mt-2 mb-2 grid gap-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-gray-700 text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {error && (
          <div className="mt-4 w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleButtonClick}
          disabled={isLoading || (price === 0 && !selectionMode)}
          className={`w-full mt-6 px-5 py-2.5 rounded-xl font-semibold text-base transition-colors duration-200 shadow-sm
            ${selectionMode
              ? isSelected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
              : price === 0
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-default'
                : popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'}
            disabled:opacity-50 disabled:cursor-not-allowed`
          }
        >
          {selectionMode
            ? isSelected
              ? 'Selected'
              : 'Select Plan'
            : price === 0
              ? 'Free Plan'
              : isLoading
                ? 'Processing...'
                : 'Subscribe Now'
          }
        </button>
      </div>
    </div>
  )
}
