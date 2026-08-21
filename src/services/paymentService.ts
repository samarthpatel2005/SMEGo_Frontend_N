// Payment Service for Razorpay integration
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Payment Service Interceptor - Token:', !!token, token?.substring(0, 20) + '...')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Payment Service Interceptor - Authorization header set')
    } else {
      console.log('Payment Service Interceptor - No token found in localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface CreateOrderRequest {
  planId: string
}

export interface CreateOrderResponse {
  success: boolean
  order: {
    id: string
    amount: number
    currency: string
    planName: string
    planPrice: number
  }
  key: string
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  planId: string
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  subscription?: {
    id: string
    planName: string
    status: string
    endDate: string
  }
}

export interface SubscriptionStatusResponse {
  success: boolean
  subscription: {
    id: string
    plan: any
    status: string
    startDate: string
    endDate: string
    amount: number
    currency: string
  } | null
  message?: string
}

// Create payment order
export const createPaymentOrder = async (planId: string, isRegistration: boolean = false): Promise<CreateOrderResponse> => {
  try {
    // Debug: Check token in localStorage
    const token = localStorage.getItem('token')
    console.log('Payment Service - Token available:', !!token)
    console.log('Payment Service - Token preview:', token?.substring(0, 20) + '...')
    
    const endpoint = isRegistration ? '/payments/registration/create-order' : '/payments/create-order'
    const response = await api.post(endpoint, { planId })
    return response.data
  } catch (error: any) {
    console.error('Payment Order Error Details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.message
    })
    throw new Error(error.response?.data?.message || 'Failed to create payment order')
  }
}

// Verify payment
export const verifyPayment = async (paymentData: VerifyPaymentRequest, isRegistration: boolean = false): Promise<VerifyPaymentResponse> => {
  try {
    const endpoint = isRegistration ? '/payments/registration/verify-payment' : '/payments/verify-payment'
    const response = await api.post(endpoint, paymentData)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment verification failed')
  }
}

// Get subscription status
export const getSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
  try {
    const response = await api.get('/payments/subscription-status')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch subscription status')
  }
}

// Cancel subscription
export const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/payments/cancel-subscription')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription')
  }
}
