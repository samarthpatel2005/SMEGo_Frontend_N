// Subscription Service
import axiosInstance from '@/lib/axios'

export interface SubscriptionData {
  id: string
  planName: string
  planDisplayName: string
  price: number
  currency: string
  interval: string
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  startDate: string
  endDate?: string
  nextBillingDate?: string
  features: string[]
  limits: {
    employees: number
    clients: number
    invoices: number
  }
}

export interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  date: string
  paymentMethod: string
  razorpayPaymentId?: string
  planName?: string
}

export interface SubscriptionUsage {
  employees: {
    used: number
    limit: number
    percentage: number
  }
  clients: {
    used: number
    limit: number
    percentage: number
  }
  invoices: {
    used: number
    limit: number
    percentage: number
  }
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalPayments: number
  hasNext: boolean
  hasPrev: boolean
}

// Get current subscription
export const getCurrentSubscription = async (): Promise<SubscriptionData> => {
  try {
    const response = await axiosInstance.get('/subscription/current')
    return response.data.subscription
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch subscription')
  }
}

// Get payment history
export const getPaymentHistory = async (page: number = 1, limit: number = 10): Promise<{
  payments: PaymentHistory[]
  pagination: PaginationInfo
}> => {
  try {
    const response = await axiosInstance.get('/subscription/payments', {
      params: { page, limit }
    })
    return {
      payments: response.data.payments,
      pagination: response.data.pagination
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment history')
  }
}

// Get subscription usage
export const getSubscriptionUsage = async (): Promise<SubscriptionUsage> => {
  try {
    const response = await axiosInstance.get('/subscription/usage')
    return response.data.usage
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch subscription usage')
  }
}

// Cancel subscription
export const cancelSubscription = async (): Promise<void> => {
  try {
    await axiosInstance.post('/subscription/cancel')
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription')
  }
}
