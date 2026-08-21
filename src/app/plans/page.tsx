'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlanCard from '@/components/ui/PlanCard'
import { fetchPlans } from '@/services/planService'
import type { Plan } from '@/services/planService'

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const fetchedPlans = await fetchPlans()
      setPlans(fetchedPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
      setError(error instanceof Error ? error.message : 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push('/dashboard?subscription=success')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Loading plans...
            </p>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose Your Plan
            </h1>
            <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
              <button 
                onClick={loadPlans}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your business needs
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Secure payments powered by Razorpay
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              planId={plan.id}
              name={plan.displayName}
              price={plan.price}
              description={`${plan.limits.employees} employees, ${plan.limits.clients} clients, ${plan.limits.invoices === -1 ? 'unlimited' : plan.limits.invoices} invoices`}
              features={plan.features}
              popular={plan.name === 'pro'}
              onPaymentSuccess={handlePaymentSuccess}
              currency={plan.currency}
              interval={plan.interval}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
