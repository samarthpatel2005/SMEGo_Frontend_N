// Organization types
export interface Organization {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  planId: string
  isActive: boolean
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  currency: string
  timezone: string
  dateFormat: string
  language: string
  fiscalYearStart: string
  invoicePrefix: string
  invoiceNumbering: 'sequential' | 'random'
  paymentTerms: number
  latePaymentFee: number
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export interface CreateOrganizationData {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
}

export interface UpdateOrganizationData {
  name?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  settings?: Partial<OrganizationSettings>
}
