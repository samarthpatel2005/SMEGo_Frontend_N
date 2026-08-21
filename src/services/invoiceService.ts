import api from '@/lib/axios';

export interface InvoiceItem { 
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number
  amount?: number
  productId?: string
  sku?: string
  costPrice?: number
}

export interface ClientLite { 
  id?: string
  name: string
  email: string
  address?: string 
}

export interface Invoice {
  _id: string
  organization: string
  createdBy: string
  invoiceNumber: string
  client: ClientLite
  items: InvoiceItem[]
  currency: string
  notes?: string
  terms?: string
  dueDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  totalCOGS?: number
  grossProfit?: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  stockReserved?: boolean
  stockFulfilled?: boolean
  stockFulfilledAt?: string
  paidAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  client: ClientLite
  items: InvoiceItem[]
  currency?: string
  notes?: string
  terms?: string
  dueDate: string
  discountAmount?: number
}

export interface ProfitAnalytics {
  totalRevenue: number
  totalCOGS: number
  totalProfit: number
  invoiceCount: number
  profitMargin: string
}

export interface InventoryInsights {
  totalProducts: number
  totalStockValue: number
  totalCostValue: number
  potentialProfit: number
  lowStockProducts: any[]
  lowStockCount: number
}

export const invoiceService = {
  list: async (status?: string) => {
    const res = await api.get('/invoices', { params: { status } })
    return res.data
  },

  create: async (payload: CreateInvoiceData) => {
    const res = await api.post('/invoices', payload)
    return res.data
  },

  get: async (id: string) => {
    const res = await api.get(`/invoices/${id}`)
    return res.data
  },

  update: async (id: string, payload: any) => {
    const res = await api.put(`/invoices/${id}`, payload)
    return res.data
  },

  delete: async (id: string) => {
    const res = await api.delete(`/invoices/${id}`)
    return res.data
  },

  markAsPaid: async (id: string, paymentData: {
    paymentMethod?: string
    paymentReference?: string
    paymentDate?: string
  }) => {
    const res = await api.post(`/invoices/${id}/mark-paid`, paymentData)
    return res.data
  },

  getProfitAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }) => {
    const res = await api.get('/invoices/analytics/profit', { params })
    return res.data
  },

  getInventoryInsights: async () => {
    const res = await api.get('/invoices/analytics/inventory')
    return res.data
  },

  pdfUrl: (id: string) => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/invoices/${id}/pdf`,

  downloadPdf: async (id: string) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to download PDF')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `invoice-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  sendInvoice: async (id: string) => {
    const res = await api.post(`/invoices/${id}/send`)
    return res.data
  },

  createCheckout: async (id: string) => {
    const res = await api.post(`/invoices/${id}/checkout`)
    return res.data
  }
}
