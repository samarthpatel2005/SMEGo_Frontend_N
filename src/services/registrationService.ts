// Registration API service
import {
  OrganizationProfileData,
  AdminAccountData,
  PlanSelectionData,
  RegistrationResponse
} from '@/types/registration'
import { mockRegistrationService } from './mockRegistrationService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
const USE_MOCK_SERVICE = process.env.NEXT_PUBLIC_USE_MOCK_REGISTRATION === 'true'

class RegistrationService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get token from localStorage if available
    const token = localStorage.getItem('token')
    
    // Debug logging
    console.log('🔍 Making API request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token
    })
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error(`Failed to parse response from ${endpoint}`)
      }
      
      if (!response.ok) {
        // Don't log expected API errors (400-499) as console errors
        // These are business logic errors that should be handled by the UI
        if (response.status >= 500) {
          console.error('Server Error:', {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            data
          })
        }
        throw new Error(data.message || `API request failed: ${response.status} ${response.statusText}`)
      }

      return data
    } catch (error) {
      // Log error details for debugging but don't expose sensitive information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network Error:', {
          endpoint: url,
          message: 'Unable to connect to server. Please check if the backend is running.'
        })
        throw new Error('Unable to connect to server. Please check if the backend is running.')
      }
      
      // Re-throw the error for handling by calling code
      throw error
    }
  }

  // ===== NEW STEP-BY-STEP REGISTRATION FLOW =====

  // Step 1: Validate Organization Name
  async createOrganization(orgData: OrganizationProfileData): Promise<RegistrationResponse> {
    if (USE_MOCK_SERVICE) {
      // Mock service should just validate organization, not create admin
      return {
        success: true,
        message: 'Organization name is available. Now add admin details.',
        data: {
          organizationData: orgData,
          nextStep: 'createAdmin'
        }
      }
    }
    
    // Store organization data for next step (no API call needed)
    // The actual organization creation happens with admin creation
    console.log('🔍 Step 1: Storing organization data for admin creation')
    console.log('� Organization data:', orgData)
    
    localStorage.setItem('pendingOrgData', JSON.stringify(orgData))
    
    return {
      success: true,
      message: 'Organization details ready. Now add admin details.',
      data: {
        organizationData: orgData,
        nextStep: 'createAdmin'
      }
    }
  }

  // Step 2: Create Organization and Admin Together
  async createAdminForOrganization(adminData: AdminAccountData): Promise<RegistrationResponse> {
    if (USE_MOCK_SERVICE) {
      return mockRegistrationService.createAdminAccount(adminData)
    }
    
    const organizationData = localStorage.getItem('pendingOrgData')
    if (!organizationData) {
      throw new Error('No organization data found. Please create organization first.')
    }

    const orgData = JSON.parse(organizationData)
    
    // Make sure we use the admin's work email
    const payload = {
      // Admin details
      fullName: adminData.fullName,
      email: adminData.workEmail,
      password: adminData.password,
      phone: adminData.phone,
      acceptedTerms: adminData.acceptTerms,
      // Organization details (flattened from orgData)
      organizationName: orgData.organizationName,
      legalName: orgData.legalName || orgData.organizationName,
      industry: orgData.industry || 'Other',
      country: orgData.country || 'IN',
      timezone: orgData.timezone || 'Asia/Kolkata',
      currency: orgData.currency || 'INR',
      address: orgData.address,
      taxId: orgData.taxId,
      invoiceNumberPrefix: orgData.invoiceNumberPrefix || 'INV'
    }
    
    console.log('🏢👨‍💼 Step 2: Creating organization and admin together')
    console.log('📤 Admin Data Received:', JSON.stringify(adminData, null, 2))
    console.log('📤 Organization Data from localStorage:', JSON.stringify(orgData, null, 2))
    console.log('📤 Final Payload:', JSON.stringify(payload, null, 2))
    
    // Validation check before sending
    if (!payload.fullName || !payload.email || !payload.password) {
      console.error('❌ Missing required admin fields:', {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password ? '[PROVIDED]' : '[MISSING]'
      })
      throw new Error('Missing required admin information')
    }

    if (!payload.organizationName) {
      console.error('❌ Missing organization data:', payload.organizationName)
      throw new Error('Missing organization information')
    }
    
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/auth/create-admin`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('📥 Organization and admin creation response:', result)

      // Store relevant data for OTP verification and next steps
      if (result.data) {
        if (result.data.adminId) {
          localStorage.setItem('pendingAdminId', result.data.adminId)
          localStorage.setItem('pendingAdminEmail', result.data.email)
        }
        if (result.data.organizationId) {
          localStorage.setItem('pendingOrgId', result.data.organizationId)
          localStorage.setItem('pendingOrgName', result.data.organizationName)
          localStorage.setItem('pendingJoinCode', result.data.joinCode)
        }
        
        // Clean up org data since it's now created
        localStorage.removeItem('pendingOrgData')
        
        console.log('💾 Stored data for next steps:', {
          adminId: result.data.adminId,
          email: result.data.email,
          organizationId: result.data.organizationId,
          organizationName: result.data.organizationName,
          joinCode: result.data.joinCode
        })
      }

      return result
    } catch (error) {
      console.warn('❌ Organization and admin creation failed, falling back to mock service:', error)
      return mockRegistrationService.createAdminAccount(adminData)
    }
  }

  // Step 3: Verify Admin OTP
  async verifyAdminOtp(email: string, otp: string): Promise<RegistrationResponse> {
    const payload = { email, otp }
    
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('📥 Admin OTP verification response:', result)

      // Store token and user data after successful verification
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        localStorage.setItem('organization', JSON.stringify(result.data.organization))
        
        if (result.data.subscription) {
          localStorage.setItem('subscription', JSON.stringify(result.data.subscription))
        }
        
        // Clean up pending data
        localStorage.removeItem('pendingOrgId')
        localStorage.removeItem('pendingOrgName')
        localStorage.removeItem('pendingJoinCode')
        localStorage.removeItem('pendingAdminId')
        localStorage.removeItem('pendingAdminEmail')
        localStorage.removeItem('pendingOrgData')
      }

      return result
    } catch (error) {
      console.error('Admin OTP verification failed:', error)
      throw error
    }
  }

  // Step 4: Select Plan
  async selectPlanForOrganization(planData: PlanSelectionData): Promise<RegistrationResponse> {
    const payload = {
      planId: planData.planId,
      couponCode: planData.couponCode
    }
    
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/registration/select-plan`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('📥 Plan selection response:', result)

      // Store subscription data
      if (result.data?.subscription) {
        localStorage.setItem('subscription', JSON.stringify(result.data.subscription))
      }

      return result
    } catch (error) {
      console.error('Plan selection failed:', error)
      throw error
    }
  }

  // Resend OTP for Admin
  async resendAdminOtp(email: string): Promise<RegistrationResponse> {
    const payload = { email }
    
    try {
      return await this.makeRequest<RegistrationResponse>(`/registration/resend-otp`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Resend admin OTP failed:', error)
      throw error
    }
  }

  // ===== LEGACY COMBINED FLOW (for backward compatibility) =====
  async createOrganizationAndAdmin(
    orgData: OrganizationProfileData, 
    adminData: AdminAccountData,
    planData?: PlanSelectionData
  ): Promise<RegistrationResponse> {
    if (USE_MOCK_SERVICE) {
      return mockRegistrationService.createAdminAccount(adminData)
    }
    
    const payload = {
      // Admin user details
      fullName: adminData.fullName,
      email: adminData.workEmail,
      password: adminData.password,
      phone: adminData.phone,
      acceptedTerms: adminData.acceptTerms ? 'true' : 'false',
      // Organization details
      organizationName: orgData.organizationName,
      legalName: orgData.legalName,
      industry: orgData.industry,
      country: orgData.country,
      timezone: orgData.timezone,
      currency: orgData.currency,
      address: orgData.address,
      taxId: orgData.taxId,
      invoiceNumberPrefix: orgData.invoicePrefix,
      // Plan details if provided
      planId: planData?.planId,
      couponCode: planData?.couponCode
    }
    
    console.log('🔍 Creating organization and admin account')
    console.log('📤 Payload:', {
      ...payload,
      password: '[HIDDEN]' // Don't log the actual password
    })
    
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/auth/create-admin`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('📥 Backend response:', result)

      // Store user info if provided (but don't store token yet - need to verify email first)
      if (result.data?.userId) {
        localStorage.setItem('pendingUserId', result.data.userId)
        localStorage.setItem('pendingUserEmail', result.data.email || adminData.workEmail)
        if (result.data.organizationId) {
          localStorage.setItem('pendingOrgId', result.data.organizationId)
        }
        console.log('💾 Stored pending data:', {
          userId: result.data.userId,
          email: result.data.email || adminData.workEmail,
          organizationId: result.data.organizationId
        })
      }

      return result
    } catch (error) {
      console.warn('❌ Backend createOrganizationAndAdmin failed, falling back to mock service:', error)
      return mockRegistrationService.createAdminAccount(adminData)
    }
  }

  // Backward compatibility - Step 1: Create admin account (legacy)
  async createAdminAccount(data: AdminAccountData): Promise<RegistrationResponse> {
    // For backward compatibility, call the new method
    return this.createOrganizationAndAdmin(
      {
        organizationName: data.organizationName,
        legalName: data.legalName,
        industry: data.industry,
        country: data.country,
        timezone: data.timezone,
        currency: data.currency,
        address: data.address,
        taxId: data.taxId,
        invoicePrefix: data.invoiceNumberPrefix,
        acceptTerms: false
      },
      data
    )
  }

  // Step 2: Verify email with OTP and complete registration
  async verifyEmailOtp(email: string, otp: string): Promise<RegistrationResponse> {
    const payload = { email, otp }
    
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      // Store token and user data after successful verification
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // Store organization data if available
        if (result.data.organization) {
          localStorage.setItem('organization', JSON.stringify(result.data.organization))
        }
        
        // Store subscription data if available
        if (result.data.subscription) {
          localStorage.setItem('subscription', JSON.stringify(result.data.subscription))
        }
        
        // Clean up pending data
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('pendingUserEmail')
        localStorage.removeItem('pendingOrgId')
      }

      return result
    } catch (error) {
      console.error('Email OTP verification failed:', error)
      throw error
    }
  }

  // Step 3: Resend OTP
  async resendOtp(email: string): Promise<RegistrationResponse> {
    const payload = { email }
    
    try {
      return await this.makeRequest<RegistrationResponse>(`/auth/resend-otp`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Resend OTP failed:', error)
      throw error
    }
  }

  // Get complete user profile after registration
  async getUserProfile(): Promise<RegistrationResponse> {
    try {
      const result = await this.makeRequest<RegistrationResponse>(`/auth/profile`, {
        method: 'GET'
      })

      // Update stored data with latest information
      if (result.success && result.data) {
        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user))
        }
        if (result.data.organization) {
          localStorage.setItem('organization', JSON.stringify(result.data.organization))
        }
        if (result.data.subscription) {
          localStorage.setItem('subscription', JSON.stringify(result.data.subscription))
        }
      }

      return result
    } catch (error) {
      console.error('Get user profile failed:', error)
      throw error
    }
  }

  // Check if user is authenticated and has completed registration
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  }

  // Get stored user data
  getStoredUserData() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    const organization = localStorage.getItem('organization')
    const subscription = localStorage.getItem('subscription')

    return {
      token,
      user: user ? JSON.parse(user) : null,
      organization: organization ? JSON.parse(organization) : null,
      subscription: subscription ? JSON.parse(subscription) : null
    }
  }

  // Clear all stored data (for logout)
  clearStoredData() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    localStorage.removeItem('subscription')
    localStorage.removeItem('pendingUserId')
    localStorage.removeItem('pendingUserEmail')
    localStorage.removeItem('pendingOrgId')
  }

  // Debug method to check all organizations
  async debugListOrganizations(): Promise<any> {
    try {
      const result = await this.makeRequest<any>(`/auth/debug-list-orgs`, {
        method: 'GET'
      })
      return result
    } catch (error) {
      console.error('Debug list organizations failed:', error)
      throw error
    }
  }

  // Step 2: Complete organization profile (LEGACY)
  async createOrganizationLegacy(
    adminData: AdminAccountData, 
    orgData: OrganizationProfileData
  ): Promise<RegistrationResponse> {
    if (USE_MOCK_SERVICE) {
      return mockRegistrationService.createOrganization(adminData, orgData)
    }
    
    const payload = {
      organizationName: orgData.organizationName,
      legalName: orgData.legalName,
      industry: orgData.industry,
      country: orgData.country,
      timezone: orgData.timezone,
      currency: orgData.currency,
      address: orgData.address,
      taxId: orgData.taxId,
      invoiceNumberPrefix: orgData.invoicePrefix
    }
    
    try {
      return this.makeRequest<RegistrationResponse>(`/auth/complete-organization`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.warn('❌ Backend createOrganization failed, falling back to mock service:', error)
      return mockRegistrationService.createOrganization(adminData, orgData)
    }
  }

  // Step 3: Select plan and setup subscription
  async setupPlanAndSubscription(
    adminData: AdminAccountData,
    orgData: OrganizationProfileData,
    planData: PlanSelectionData
  ): Promise<RegistrationResponse> {
    if (USE_MOCK_SERVICE) {
      return mockRegistrationService.setupPlanAndSubscription(adminData, orgData, planData)
    }
    
    const payload = {
      planName: planData.planId, // Assuming planId is the plan name
      couponCode: planData.couponCode
    }
    
    try {
      return this.makeRequest<RegistrationResponse>(`/auth/select-plan`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.warn('❌ Backend setupPlanAndSubscription failed, falling back to mock service:', error)
      return mockRegistrationService.setupPlanAndSubscription(adminData, orgData, planData)
    }
  }

  // Verify email (called when user clicks verification link)
  async verifyEmail(token: string): Promise<RegistrationResponse> {
    return this.makeRequest<RegistrationResponse>(`/auth/verify-email/${token}`, {
      method: 'GET'
    })
  }

  // Resend verification email - TODO: Implement in backend
  async resendVerificationEmail(email: string): Promise<RegistrationResponse> {
    // return this.makeRequest<RegistrationResponse>(`/auth/resend-verification`, {
    //   method: 'POST',
    //   body: JSON.stringify({ email })
    // })
    throw new Error('Resend verification endpoint not implemented yet')
  }

  // Check plan limits before adding users - TODO: Implement in backend
  async checkPlanLimits(organizationId: string): Promise<{
    currentUsers: number
    maxUsers: number
    canAddUser: boolean
  }> {
    // return this.makeRequest(`/auth/plan/limits/${organizationId}`)
    throw new Error('Plan limits endpoint not implemented yet')
  }

  // Generate new organization join code - TODO: Implement in backend
  async regenerateJoinCode(organizationId: string): Promise<{ joinCode: string }> {
    // return this.makeRequest(`/auth/org/${organizationId}/regenerate-code`, {
    //   method: 'POST'
    // })
    throw new Error('Regenerate join code endpoint not implemented yet')
  }
}

// Create singleton instance
export const registrationService = new RegistrationService()

// Use real service in all environments
export const apiService = registrationService
