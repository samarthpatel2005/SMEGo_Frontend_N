import { useEffect, useState } from 'react'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  isPopular?: boolean
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // TODO: Replace with actual API call
        const mockPlans: Plan[] = [
          {
            id: 'starter',
            name: 'Starter',
            price: 29,
            features: [
              'Up to 5 employees',
              'Basic invoicing',
              'Client management',
              'Email support'
            ]
          },
          {
            id: 'professional',
            name: 'Professional',
            price: 79,
            features: [
              'Up to 25 employees',
              'Advanced invoicing',
              'Payroll management',
              'Analytics dashboard',
              'Priority support'
            ],
            isPopular: true
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199,
            features: [
              'Unlimited employees',
              'Custom integrations',
              'Advanced analytics',
              'Multi-organization support',
              'Dedicated support'
            ]
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setPlans(mockPlans)
      } catch (err) {
        setError('Failed to fetch plans')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const subscribeToPlan = async (planId: string) => {
    try {
      // TODO: Implement subscription logic
      console.log('Subscribing to plan:', planId)
      
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return { success: true, message: 'Successfully subscribed to plan' }
    } catch (error) {
      throw new Error('Subscription failed')
    }
  }

  return {
    plans,
    isLoading,
    error,
    subscribeToPlan
  }
}
