// Registration validation utilities and constants

export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+[1-9]\d{1,14}$/,
  password: {
    minLength: 8,
    hasUpper: /[A-Z]/,
    hasLower: /[a-z]/,
    hasDigit: /\d/
  },
  organizationCode: /^[A-Z0-9]{6,8}$/,
  invoicePrefix: /^[A-Z0-9]{2,10}$/,
  taxId: /^[A-Z0-9]{5,20}$/
}

export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number in international format (e.g., +1234567890)',
  password: {
    minLength: 'Password must be at least 8 characters long',
    complexity: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
  },
  passwordMatch: 'Passwords do not match',
  nameLength: (min: number, max: number) => `Name must be between ${min} and ${max} characters`,
  organizationCode: 'Organization code should be 6-8 uppercase letters/numbers',
  invoicePrefix: 'Invoice prefix should be 2-10 uppercase letters/numbers',
  taxId: 'Tax ID seems too short',
  terms: 'You must accept the Terms & Privacy Policy',
  duplicateEmail: 'Duplicate email address'
}

export const FIELD_LIMITS = {
  fullName: { min: 2, max: 80 },
  organizationName: { min: 2, max: 100 },
  password: { min: 8 },
  organizationCode: { min: 6, max: 8 },
  invoicePrefix: { min: 2, max: 10 },
  taxId: { min: 5, max: 20 }
}

// Country and currency data
export const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'] },
  { code: 'IN', name: 'India', currency: 'INR', timezones: ['Asia/Kolkata'] },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezones: ['Europe/London'] },
  { code: 'CA', name: 'Canada', currency: 'CAD', timezones: ['America/Toronto', 'America/Vancouver'] },
  { code: 'AU', name: 'Australia', currency: 'AUD', timezones: ['Australia/Sydney', 'Australia/Melbourne'] },
  { code: 'DE', name: 'Germany', currency: 'EUR', timezones: ['Europe/Berlin'] },
  { code: 'FR', name: 'France', currency: 'EUR', timezones: ['Europe/Paris'] },
  { code: 'SG', name: 'Singapore', currency: 'SGD', timezones: ['Asia/Singapore'] },
  { code: 'JP', name: 'Japan', currency: 'JPY', timezones: ['Asia/Tokyo'] },
  { code: 'BR', name: 'Brazil', currency: 'BRL', timezones: ['America/Sao_Paulo'] },
  { code: 'MX', name: 'Mexico', currency: 'MXN', timezones: ['America/Mexico_City'] },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', timezones: ['Africa/Johannesburg'] }
]

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
]

// Plan data
// export const SAMPLE_PLANS = [
//   {
//     id: 'basic',
//     name: 'Basic',
//     price: 29,
//     currency: 'USD',
//     interval: 'monthly' as const,
//     userLimit: 5,
//     trialDays: 7,
//     features: [
//       'Up to 5 users',
//       'Basic invoicing',
//       'Client management',
//       'Basic reporting',
//       'Email support'
//     ]
//   },
//   {
//     id: 'pro',
//     name: 'Professional',
//     price: 79,
//     currency: 'USD',
//     interval: 'monthly' as const,
//     userLimit: 25,
//     trialDays: 7,
//     isPopular: true,
//     features: [
//       'Up to 25 users',
//       'Advanced invoicing',
//       'Client portal',
//       'Advanced reporting',
//       'Payroll management',
//       'Priority support'
//     ]
//   },
//   {
//     id: 'enterprise',
//     name: 'Enterprise',
//     price: 199,
//     currency: 'USD',
//     interval: 'monthly' as const,
//     userLimit: 100,
//     trialDays: 14,
//     features: [
//       'Up to 100 users',
//       'Custom features',
//       'API access',
//       'Custom integrations',
//       'Dedicated support',
//       'Custom reporting'
//     ]
//   }
// ]

// Validation functions
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return VALIDATION_MESSAGES.required('Email')
  if (!VALIDATION_PATTERNS.email.test(email)) return VALIDATION_MESSAGES.email
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return VALIDATION_MESSAGES.required('Password')
  if (password.length < VALIDATION_PATTERNS.password.minLength) {
    return VALIDATION_MESSAGES.password.minLength
  }
  
  const hasUpper = VALIDATION_PATTERNS.password.hasUpper.test(password)
  const hasLower = VALIDATION_PATTERNS.password.hasLower.test(password)
  const hasDigit = VALIDATION_PATTERNS.password.hasDigit.test(password)
  
  if (!hasUpper || !hasLower || !hasDigit) {
    return VALIDATION_MESSAGES.password.complexity
  }
  
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return VALIDATION_MESSAGES.required('Confirm Password')
  if (password !== confirmPassword) return VALIDATION_MESSAGES.passwordMatch
  return null
}

export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name.trim()) return VALIDATION_MESSAGES.required(fieldName)
  const { min, max } = FIELD_LIMITS.fullName
  if (name.trim().length < min || name.trim().length > max) {
    return VALIDATION_MESSAGES.nameLength(min, max)
  }
  return null
}

export const validatePhone = (phone: string): string | null => {
  if (phone && phone.trim() && !VALIDATION_PATTERNS.phone.test(phone.trim())) {
    return VALIDATION_MESSAGES.phone
  }
  return null
}

export const validateOrganizationCode = (code: string): string | null => {
  if (!code.trim()) return VALIDATION_MESSAGES.required('Organization Code')
  if (!VALIDATION_PATTERNS.organizationCode.test(code.trim())) {
    return VALIDATION_MESSAGES.organizationCode
  }
  return null
}

// Utility functions
export const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const calculateTrialEndDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

// Role options
export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin - Full access' },
  { value: 'manager', label: 'Manager - Team management' },
  { value: 'employee', label: 'Employee - Basic access' }
]

// API endpoints (these would be environment-specific)
export const REGISTRATION_ENDPOINTS = {
  validateInvite: '/api/auth/invite/validate',
  validateOrgCode: '/api/auth/org/validate',
  createAdmin: '/api/auth/register/admin',
  createOrganization: '/api/auth/register/organization',
  setupPlan: '/api/auth/register/plan'
}
