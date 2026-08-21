// Plan types
export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingInterval: 'monthly' | 'yearly'
  features: PlanFeature[]
  limits: PlanLimits
  isPopular: boolean
  isActive: boolean
  stripePriceId?: string
  createdAt: string
  updatedAt: string
}

export interface PlanFeature {
  id: string
  name: string
  description: string
  included: boolean
}

export interface PlanLimits {
  maxUsers: number
  maxClients: number
  maxInvoices: number
  maxStorage: number // in GB
  supportLevel: 'basic' | 'priority' | 'dedicated'
  customIntegrations: boolean
  advancedReporting: boolean
  multiOrganization: boolean
}

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  plan: Plan
  createdAt: string
  updatedAt: string
}
