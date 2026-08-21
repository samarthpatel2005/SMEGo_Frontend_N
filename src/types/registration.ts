// Registration flow types
export interface RegistrationStep {
  step: number
  title: string
  completed: boolean
}

export interface AdminAccountData {
  fullName: string
  workEmail: string
  password: string
  confirmPassword: string
  phone?: string
  acceptTerms: boolean
  // Organization details - now collected during admin account creation
  organizationName: string
  legalName?: string
  industry?: string
  country: string
  timezone: string
  currency: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal?: string
    country?: string
  }
  taxId?: string
  invoiceNumberPrefix?: string
}

export interface OrganizationProfileData {
  organizationName: string
  legalName?: string
  industry?: string
  country: string
  timezone: string
  currency: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal?: string
    country?: string
  }
  taxId?: string
  invoicePrefix?: string
  joinCode?: string
  acceptTerms: boolean // Add terms acceptance to organization profile
}

export interface PlanSelectionData {
  planId: string
  usersLimit: number
  trialEnd: string
  couponCode?: string
}

export interface TeamInviteData {
  invites: {
    email: string
    role: 'admin' | 'manager' | 'employee'
  }[]
}

export interface EmployeeJoinData {
  fullName: string
  workEmail: string
  password: string
  confirmPassword: string
  phone?: string
  department?: string
  position?: string
  acceptTerms: boolean
  organizationCode?: string
  inviteToken?: string
}

export type RegistrationPath = 'create' | 'join'

export interface RegistrationState {
  path: RegistrationPath | null
  currentStep: number
  adminAccount: AdminAccountData
  organizationProfile: OrganizationProfileData
  planSelection: PlanSelectionData
  teamInvites: TeamInviteData
  employeeJoin: EmployeeJoinData
}

export interface InviteTokenData {
  token: string
  organizationId: string
  organizationName: string
  role: string
  email?: string
  expiresAt: string
}

export interface JoinCodeData {
  code: string
  organizationId: string
  organizationName: string
  allowedDomains?: string[]
  defaultRole: string
}

// Validation errors
export interface ValidationErrors {
  [key: string]: string
}

// API responses
export interface RegistrationResponse {
  success: boolean
  message: string
  data?: any
  errors?: ValidationErrors
}

// Industry options
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Real Estate',
  'Legal',
  'Marketing',
  'Construction',
  'Food & Beverage',
  'Transportation',
  'Media',
  'Other'
] as const

export type Industry = typeof INDUSTRIES[number]

// Country and currency data
export interface CountryData {
  code: string
  name: string
  currency: string
  timezone: string[]
}

// Plan display data
export interface PlanDisplayData {
  id: string
  name: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  userLimit: number
  isPopular?: boolean
  trialDays: number
}
