// Plan Service for fetching plans from database
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  currency: string
  interval: string
  limits: {
    employees: number
    clients: number
    invoices: number
  }
  features: string[]
  isActive: boolean
}

export interface PlansResponse {
  success: boolean
  plans: Plan[]
}

// Fetch all active plans
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get<PlansResponse>('/plans')
    if (response.data.success) {
      return response.data.plans
    } else {
      throw new Error('Failed to fetch plans')
    }
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch plans')
  }
}

// Fetch single plan by ID
export const fetchPlanById = async (planId: string): Promise<Plan> => {
  try {
    const response = await api.get(`/plans/${planId}`)
    if (response.data.success) {
      return response.data.plan
    } else {
      throw new Error('Plan not found')
    }
  } catch (error: any) {
    console.error('Error fetching plan:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch plan')
  }
}
