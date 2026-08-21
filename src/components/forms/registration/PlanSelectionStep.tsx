'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PlanCard from '@/components/ui/PlanCard'
import { calculateTrialEndDate } from '@/lib/registration'
import { initiateRazorpayPayment, verifyRazorpayPayment } from '@/lib/razorpay'
import { PlanSelectionData, ValidationErrors } from '@/types/registration'
import { fetchPlans, Plan } from '@/services/planService'
import React, { useEffect, useState } from 'react'

interface PlanSelectionStepProps {
  data: PlanSelectionData
  onChange: (data: PlanSelectionData) => void
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Load plans from API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true)
        const fetchedPlans = await fetchPlans()
        setPlans(fetchedPlans)
      } catch (error) {
        console.error('Error loading plans:', error)
      } finally {
        setPlansLoading(false)
      }
    }
    loadPlans()
  }, [])

  useEffect(() => {
    if (data.planId) {
      const plan = plans.find(p => p.id === data.planId || p.name === data.planId)
      setSelectedPlan(plan || null)
    }
  }, [data.planId, plans])

  const handlePlanSelect = (plan: Plan) => {
    const trialEnd = calculateTrialEndDate(14) // Default 14 days trial
    
    onChange({
      ...data,
      planId: plan.id,
      usersLimit: plan.limits.employees + plan.limits.clients, // Total users from limits
      trialEnd
    })
    
    setSelectedPlan(plan)
    
    // Clear plan selection error
    if (errors.planId) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.planId
        return newErrors
      })
    }
  }

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful, proceeding to next step')
    onNext() // Continue to completion step or redirect to dashboard
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    try {
      setPaymentLoading(true)

      // Handle free plan
      if (selectedPlan.price === 0) {
        handlePaymentSuccess()
        return
      }

      // Get user details from localStorage (set after OTP verification)
      const adminData = localStorage.getItem('admin')
      
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
      const paymentResponse = await initiateRazorpayPayment(selectedPlan.id, userDetails, true) // true for registration

      // Verify payment on server
      const verificationResult = await verifyRazorpayPayment(paymentResponse, selectedPlan.id, true) // true for registration

      if (verificationResult.success) {
        handlePaymentSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCouponChange = (couponCode: string) => {
    onChange({
      ...data,
      couponCode
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Start with a free trial, upgrade or downgrade at any time</p>
      </div>

      {/* Plan Selection */}
      <div className="flex gap-6 mb-8">
        {plansLoading ? (
          <div className="col-span-3 text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-600">No plans available</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              planId={plan.id}
              name={plan.displayName}
              price={plan.price}
              description={`${plan.limits.employees} employees, ${plan.limits.clients} clients, ${plan.limits.invoices} invoices`}
              currency={plan.currency}
              interval={plan.interval}
              features={plan.features}
              popular={plan.name.toLowerCase() === 'pro'}
              selectionMode={true}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={() => handlePlanSelect(plan)}
              onPaymentSuccess={handlePaymentSuccess}
            />
          ))
        )}
      </div>

      {errors.planId && (
        <div className="mb-6 text-center">
          <p className="text-sm text-red-600">{errors.planId}</p>
        </div>
      )}

            {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Plan Summary</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
            <div>
              <span className="text-gray-600">Plan:</span>
              <p className="font-medium">{selectedPlan.displayName}</p>
            </div>
            <div>
              <span className="text-gray-600">User Limits:</span>
              <p className="font-medium">{selectedPlan.limits.employees} employees, {selectedPlan.limits.clients} clients</p>
            </div>
            <div>
              <span className="text-gray-600">Trial Ends:</span>
              <p className="font-medium">
                {new Date(data.trialEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Subscribe Button for Selected Plan */}
          <div className="text-center">
            <Button
              onClick={handleSubscribe}
              disabled={paymentLoading}
              className="px-8 py-3 text-lg"
            >
              {paymentLoading 
                ? 'Processing Payment...' 
                : selectedPlan.price === 0 
                  ? 'Start Free Trial' 
                  : `Subscribe for ₹${selectedPlan.price}/${selectedPlan.interval}`
              }
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              {selectedPlan.price === 0 
                ? 'No payment required for free plan'
                : 'Secure payment via Razorpay'
              }
            </p>
          </div>
        </div>
      )}

      {/* Coupon Code */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <Input
            label="Coupon Code (Optional)"
            type="text"
            value={data.couponCode || ''}
            onChange={(e) => handleCouponChange(e.target.value)}
            placeholder="Enter coupon code"
          />
        </div>
      </div>

      {/* Trial Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Free Trial Information</h4>
            <p className="text-gray-600 mb-3">
              Your 14-day free trial starts immediately. No credit card required during the trial period.
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Full access to all features</li>
              <li>• Cancel anytime during trial</li>
              <li>• Automatic billing after trial ends</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading || paymentLoading}
        >
          Back
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {selectedPlan ? 'Click "Subscribe" above to proceed with payment' : 'Please select a plan above'}
          </p>
          {!selectedPlan && (
            <Button
              type="button"
              disabled={true}
            >
              Please Select a Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlanSelectionStep
