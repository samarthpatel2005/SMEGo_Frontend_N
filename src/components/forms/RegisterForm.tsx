'use client'

import StepIndicator from '@/components/ui/StepIndicator'
import { apiService } from '@/services/registrationService'
import {
    AdminAccountData,
    EmployeeJoinData,
    OrganizationProfileData,
    PlanSelectionData,
    RegistrationPath,
    RegistrationState,
    TeamInviteData
} from '@/types/registration'
import React, { useState } from 'react'
import RegistrationPathSelector from './RegistrationPathSelector'
import AdminAccountStep from './registration/AdminAccountStep'
import EmployeeJoinForm from './registration/EmployeeJoinForm'
import OrganizationProfileStep from './registration/OrganizationProfileStep'
import OtpVerification from './registration/OtpVerification'
import PlanSelectionStep from './registration/PlanSelectionStep'

interface RegisterFormProps {
  mode?: RegistrationPath
}
const RegisterForm: React.FC<RegisterFormProps> = ({ mode }) => {
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    path: mode || null,
    currentStep: mode ? 1 : 0,
    adminAccount: {
      fullName: '',
      workEmail: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptTerms: false,
      // Organization details
      organizationName: '',
      legalName: '',
      industry: '',
      country: 'IN',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      address: {},
      taxId: '',
      invoiceNumberPrefix: 'INV'
    },
    organizationProfile: {
      organizationName: '',
      legalName: '',
      industry: '',
      country: '',
      timezone: '',
      currency: '',
      address: {},
      taxId: '',
      invoicePrefix: 'INV',
      joinCode: '',
      acceptTerms: false
    },
    planSelection: {
      planId: '',
      usersLimit: 0,
      trialEnd: '',
      couponCode: ''
    },
    teamInvites: {
      invites: []
    },
    employeeJoin: {
      fullName: '',
      workEmail: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptTerms: false,
      organizationCode: ''
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)

  // Define steps for organization creation (proper 5-step flow)
  const organizationSteps = [
    { number: 1, title: 'Organization Details', completed: registrationState.currentStep > 1, current: registrationState.currentStep === 1 },
    { number: 2, title: 'Admin Account', completed: registrationState.currentStep > 2, current: registrationState.currentStep === 2 },
    { number: 3, title: 'Email Verification', completed: registrationState.currentStep > 3, current: registrationState.currentStep === 3 },
    { number: 4, title: 'Select Plan', completed: registrationState.currentStep > 4, current: registrationState.currentStep === 4 },
    { number: 5, title: 'Complete Setup', completed: registrationState.currentStep > 5, current: registrationState.currentStep === 5 }
  ]

  const handlePathSelection = (path: RegistrationPath) => {
    setRegistrationState(prev => ({
      ...prev,
      path,
      currentStep: 1
    }))
  }

  const handleBack = () => {
    if (registrationState.currentStep === 1) {
      setRegistrationState(prev => ({
        ...prev,
        path: null,
        currentStep: 0
      }))
    } else {
      setRegistrationState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  const handleNext = () => {
    setRegistrationState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }))
  }

  const handleAdminAccountChange = (data: AdminAccountData) => {
    setRegistrationState(prev => ({
      ...prev,
      adminAccount: data
    }))
  }

  const handleOrganizationProfileChange = (data: OrganizationProfileData) => {
    setRegistrationState(prev => ({
      ...prev,
      organizationProfile: data
    }))
  }

  const handlePlanSelectionChange = (data: PlanSelectionData) => {
    setRegistrationState(prev => ({
      ...prev,
      planSelection: data
    }))
  }

  const handleTeamInvitesChange = (data: TeamInviteData) => {
    setRegistrationState(prev => ({
      ...prev,
      teamInvites: data
    }))
  }

  // Step 1: Create/validate organization
  const handleOrganizationProfileNext = async () => {
    setIsLoading(true)
    try {
      const result = await apiService.createOrganization(registrationState.organizationProfile)
      
      if (result.success) {
        console.log('✅ Organization validation successful:', result)
        handleNext() // Move to admin account step
      } else {
        console.error('❌ Organization validation failed:', result.message)
        // You could show an error toast here
      }
    } catch (error) {
      console.error('❌ Organization validation error:', error)
      // You could show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Create admin and organization together
  const handleAdminAccountNext = async () => {
    setIsLoading(true)
    try {
      const result = await apiService.createAdminForOrganization(registrationState.adminAccount)
      
      if (result.success) {
        console.log('✅ Admin and organization created successfully:', result)
        // Check if we need email verification
        if (result.data?.needsEmailVerification) {
          handleNext() // Move to OTP verification step
        } else {
          // Skip to plans if no OTP needed (fallback)
          setRegistrationState(prev => ({ ...prev, currentStep: 4 }))
        }
      } else {
        console.error('❌ Admin account creation failed:', result.message)
        // You could show an error toast here
      }
    } catch (error) {
      console.error('❌ Admin account creation error:', error)
      // You could show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Handle OTP verification completion
  const handleOtpVerified = () => {
    console.log('✅ OTP verification completed')
    // Continue to plan selection step in the registration flow
    handleNext() // Move to step 4 (plan selection)
  }

  // Step 4: Handle plan selection and payment
  const handlePlanSelectionNext = async () => {
    setIsLoading(true)
    try {
      const result = await apiService.selectPlanForOrganization(registrationState.planSelection)
      
      if (result.success) {
        console.log('✅ Plan selection completed:', result)
        // Redirect to dashboard after successful plan selection and payment
        window.location.href = '/auth/login'
      } else {
        console.error('❌ Plan selection failed:', result.message)
        // You could show an error toast here
      }
    } catch (error) {
      console.error('❌ Plan selection error:', error)
      // You could show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  // Render path selection if no path is chosen
  if (!registrationState.path) {
    return <RegistrationPathSelector onSelectPath={handlePathSelection} />
  }

  // Render employee join flow
  if (registrationState.path === 'join') {
    function handleEmployeeJoin(data: EmployeeJoinData): Promise<void> {
      throw new Error('Function not implemented.')
    }

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Join Organization
          </h1>
          <p className="text-lg text-gray-600">
            Join as an Employee using your organization code
          </p>
        </div>
        <EmployeeJoinForm
          onSubmit={handleEmployeeJoin}
          onBack={handleBack}
          isLoading={isLoading}
        />
      </div>
    )
  }

  // Render organization creation flow
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Create Your Organization
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Set up your business account in just a few simple steps
        </p>
      </div>

      {/* Step Indicator - Centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <StepIndicator steps={organizationSteps} />
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-2xl mx-auto">
        {/* Step 1: Organization Profile */}
        {registrationState.currentStep === 1 && (
          <OrganizationProfileStep
            data={registrationState.organizationProfile}
            onChange={handleOrganizationProfileChange}
            onNext={handleOrganizationProfileNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}

        {/* Step 2: Admin Account */}
        {registrationState.currentStep === 2 && (
          <AdminAccountStep
            data={registrationState.adminAccount}
            onChange={handleAdminAccountChange}
            onNext={handleAdminAccountNext}
            onBack={handleBack}
            isLoading={isLoading}
            showOtpVerification={false}
            onOtpVerified={handleOtpVerified}
          />
        )}

        {/* Step 3: OTP Verification */}
        {registrationState.currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a verification code to your email address
              </p>
            </div>
            <OtpVerification
              email={registrationState.adminAccount.workEmail}
              onVerified={handleOtpVerified}
              onBack={handleBack}
            />
          </div>
        )}

        {/* Step 4: Plan Selection */}
        {registrationState.currentStep === 4 && (
          <PlanSelectionStep
            data={registrationState.planSelection}
            onChange={handlePlanSelectionChange}
            onNext={handlePlanSelectionNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default RegisterForm