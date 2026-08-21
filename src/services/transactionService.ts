import axiosInstance from '@/lib/axios'

export interface Transaction {
  _id: string
  organization: string
  
  // Product information
  product: {
    _id: string | null
    name: string
    sku: string
    category?: string
  } | null
  
  // Transaction type and details
  type: 'purchase' | 'sale' | 'adjustment_increase' | 'adjustment_decrease' | 'damage' | 'loss' | 'return' | 'transfer_in' | 'transfer_out'
  quantity: number
  unitPrice: number
  totalCost?: number // For manual transactions
  totalAmount?: number // For invoice transactions
  taxRate?: number
  reason?: string
  
  // Stock tracking (for manual transactions)
  stockBefore?: number | null
  stockAfter?: number | null
  performedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  
  // Invoice-based transaction fields
  invoiceId?: string
  invoiceNumber?: string
  transactionId?: string
  client?: {
    name: string
    email: string
    address?: string
  }
  paymentMethod?: string
  paymentReference?: string
  paymentDate?: string
  
  // Reference tracking
  referenceType?: string
  referenceId?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionData {
  productId: string
  type: 'purchase' | 'sale' | 'adjustment_increase' | 'adjustment_decrease' | 'damage' | 'loss' | 'return' | 'transfer_in' | 'transfer_out'
  quantity: number
  unitPrice?: number
  reason?: string
  referenceType?: string
  referenceId?: string
}

export interface TransactionListResponse {
  success: boolean
  data: Transaction[]
  pagination: {
    current: number
    pages: number
    total: number
  }
}

export interface TransactionAnalytics {
  totalTransactions: number
  totalValue: number
  typeBreakdown: Record<string, { count: number; value: number }>
  categoryBreakdown: Record<string, { count: number; value: number }>
  monthlyTrend: Record<string, { count: number; value: number }>
}

export interface BulkImportResult {
  successful: Transaction[]
  failed: Array<{
    index: number
    data: any
    error: string
  }>
  total: number
}

class TransactionService {
  async list(params?: {
    type?: string
    productId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
    search?: string
  }): Promise<TransactionListResponse> {
    const response = await axiosInstance.get('/transactions', { params })
    return response.data
  }

  async create(data: CreateTransactionData): Promise<{ success: boolean; data: Transaction; message: string }> {
    const response = await axiosInstance.post('/transactions', data)
    return response.data
  }

  async getById(id: string): Promise<{ success: boolean; data: Transaction }> {
    const response = await axiosInstance.get(`/transactions/${id}`)
    return response.data
  }

  async bulkImport(transactions: CreateTransactionData[]): Promise<{ success: boolean; data: BulkImportResult; message: string }> {
    const response = await axiosInstance.post('/transactions/bulk-import', { transactions })
    return response.data
  }

  async getAnalytics(params?: {
    startDate?: string
    endDate?: string
    productId?: string
  }): Promise<{ success: boolean; data: TransactionAnalytics }> {
    const response = await axiosInstance.get('/transactions/analytics', { params })
    return response.data
  }

  // New method for invoice-based transactions
  async getInvoiceTransactions(params?: {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<TransactionListResponse> {
    const response = await axiosInstance.get('/transactions/invoice-transactions', { params })
    return response.data
  }
}

export const transactionService = new TransactionService()
