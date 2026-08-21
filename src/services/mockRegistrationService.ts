// Mock registration service for development/testing
import {
    AdminAccountData,
    OrganizationProfileData,
    PlanSelectionData,
    RegistrationResponse,
    TeamInviteData
} from '@/types/registration'

export class MockRegistrationService {
  async createAdminAccount(data: AdminAccountData): Promise<RegistrationResponse> {
    console.log('🎭 Using mock service for createAdminAccount')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate validation
    if (!data.acceptTerms) {
      throw new Error('You must accept terms and conditions')
    }
    
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    
    const mockToken = 'mock_token_' + Date.now()
    localStorage.setItem('token', mockToken)
    
    return {
      success: true,
      message: 'Admin account created successfully (mock)',
      data: {
        userId: 'mock_user_id',
        email: data.workEmail,
        organizationId: 'mock_org_id',
        needsEmailVerification: false,
        token: mockToken
      }
    }
  }
  
  async createOrganization(
    adminData: AdminAccountData, 
    orgData: OrganizationProfileData
  ): Promise<RegistrationResponse> {
    console.log('🎭 Using mock service for createOrganization')
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      success: true,
      message: 'Organization profile completed successfully (mock)',
      data: {
        organizationId: 'mock_org_id',
        organizationName: orgData.organizationName,
        joinCode: 'ABC123'
      }
    }
  }
  
  async setupPlanAndSubscription(
    adminData: AdminAccountData,
    orgData: OrganizationProfileData,
    planData: PlanSelectionData
  ): Promise<RegistrationResponse> {
    console.log('🎭 Using mock service for setupPlanAndSubscription')
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return {
      success: true,
      message: 'Plan selected successfully (mock)',
      data: {
        planId: planData.planId,
        subscriptionId: 'mock_subscription_id'
      }
    }
  }
  
  async completeSetupAndSendInvites(
    adminData: AdminAccountData,
    orgData: OrganizationProfileData,
    planData: PlanSelectionData,
    inviteData: TeamInviteData
  ): Promise<RegistrationResponse> {
    console.log('🎭 Using mock service for completeSetupAndSendInvites')
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    return {
      success: true,
      message: `Invites sent successfully to ${inviteData.invites.length} recipients (mock)`,
      data: {
        invitesSent: inviteData.invites.length,
        invites: inviteData.invites.map(invite => ({
          email: invite.email,
          role: invite.role,
          status: 'sent'
        }))
      }
    }
  }
}

export const mockRegistrationService = new MockRegistrationService()
