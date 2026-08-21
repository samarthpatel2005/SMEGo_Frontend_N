// Invoice types
export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  organizationId: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paymentDate?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  notes?: string
  terms?: string
  items: InvoiceItem[]
  client: {
    id: string
    name: string
    email: string
    address: string
  }
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

export interface CreateInvoiceData {
  clientId: string
  dueDate: string
  items: Omit<InvoiceItem, 'id'>[]
  notes?: string
  terms?: string
  discountAmount?: number
}

export interface UpdateInvoiceData {
  clientId?: string
  dueDate?: string
  status?: string
  items?: Omit<InvoiceItem, 'id'>[]
  notes?: string
  terms?: string
  discountAmount?: number
}
