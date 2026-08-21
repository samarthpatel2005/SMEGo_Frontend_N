import axiosInstance from '@/lib/axios'

export interface Complaint {
  _id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'billing' | 'service' | 'technical' | 'product' | 'other'
  invoiceId?: string
  invoiceNumber?: string
  organization: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  resolution?: string
  resolvedAt?: string
  resolvedBy?: {
    _id: string
    fullName: string
    email: string
  }
  internalNotes: Array<{
    note: string
    addedBy: {
      _id: string
      fullName: string
      email: string
    }
    addedAt: string
  }>
  createdAt: string
  updatedAt: string
  ageInDays?: number
}

export interface ComplaintStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  urgent: number
  high: number
}

export interface ComplaintSubmissionData {
  clientName: string
  clientEmail: string
  clientPhone?: string
  subject: string
  description: string
  priority: string
  category: string
  invoiceNumber?: string
  organizationId: string
}

export interface ComplaintFilters {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  search?: string
}

export const complaintService = {
  // Public endpoint - submit a complaint
  async submitComplaint(data: ComplaintSubmissionData) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/complaints/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    return response.json()
  },

  // Protected endpoints - require authentication
  async getComplaints(filters: ComplaintFilters = {}) {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const response = await axiosInstance.get(`/complaints?${queryParams}`)
    return response.data
  },

  async getComplaintById(id: string) {
    const response = await axiosInstance.get(`/complaints/${id}`)
    return response.data
  },

  async getComplaintStats() {
    const response = await axiosInstance.get('/complaints/stats')
    return response.data
  },

  async updateComplaint(id: string, data: {
    status?: string
    resolution?: string
    internalNote?: string
  }) {
    const response = await axiosInstance.put(`/complaints/${id}`, data)
    return response.data
  },

  async deleteComplaint(id: string) {
    const response = await axiosInstance.delete(`/complaints/${id}`)
    return response.data
  }
}
