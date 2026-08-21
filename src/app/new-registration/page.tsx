'use client'

import { registrationService } from '@/services/registrationService'
import { useState } from 'react'
import { OrganizationProfileData, AdminAccountData, PlanSelectionData } from '@/types/registration'

interface RegistrationStep {
  step: number
  title: string
  completed: boolean
}

export default function NewRegistrationFlowPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [steps] = useState<RegistrationStep[]>([
    { step: 1, title: 'Organization Details', completed: false },
    { step: 2, title: 'Admin Account', completed: false },
    { step: 3, title: 'Email Verification', completed: false },
    { step: 4, title: 'Select Plan', completed: false },
    { step: 5, title: 'Dashboard', completed: false }
  ])

  // Test data
  const [orgData] = useState<OrganizationProfileData>({
    organizationName: 'SMEGo Demo Company',
    legalName: 'SMEGo Demo Company Private Limited',
    industry: 'Technology',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    address: {
      street: '123 Demo Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal: '400001',
      country: 'IN'
    },
    taxId: 'DEMO123456789',
    invoicePrefix: 'DEMO'
  })

  const [adminData] = useState<AdminAccountData>({
    fullName: 'Demo Admin User',
    workEmail: 'admin@smegoDemo.com',
    password: 'Demo123456',
    confirmPassword: 'Demo123456',
    phone: '+919876543210',
    acceptTerms: true,
    organizationName: 'SMEGo Demo Company',
    legalName: 'SMEGo Demo Company Private Limited',
    industry: 'Technology',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    address: {
      street: '123 Demo Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal: '400001',
      country: 'IN'
    },
    taxId: 'DEMO123456789',
    invoiceNumberPrefix: 'DEMO'
  })

  const [planData] = useState<PlanSelectionData>({
    planId: 'starter',
    usersLimit: 10,
    trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    couponCode: ''
  })

  // Step 1: Create Organization
  const testStep1CreateOrganization = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 1: Creating organization...')
      
      const result = await registrationService.createOrganization(orgData)
      
      console.log('✅ Step 1 Success:', result)
      setResult(`Step 1 - Organization Created:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('❌ Step 1 Error:', error)
      setResult(`Step 1 Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Create Admin
  const testStep2CreateAdmin = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 2: Creating admin...')
      
      const result = await registrationService.createAdminForOrganization(adminData)
      
      console.log('✅ Step 2 Success:', result)
      setResult(`Step 2 - Admin Created:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(3)
      }
    } catch (error) {
      console.error('❌ Step 2 Error:', error)
      setResult(`Step 2 Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify Admin OTP
  const testStep3VerifyOTP = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 3: Verifying admin OTP...')
      
      // For testing, using a sample OTP - in real scenario, user would enter the OTP from email
      const testOTP = '123456'
      
      const result = await registrationService.verifyAdminOtp(adminData.workEmail, testOTP)
      
      console.log('✅ Step 3 Success:', result)
      setResult(`Step 3 - Admin OTP Verified:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(4)
      }
    } catch (error) {
      console.error('❌ Step 3 Error:', error)
      setResult(`Step 3 Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Select Plan
  const testStep4SelectPlan = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 4: Selecting plan...')
      
      const result = await registrationService.selectPlanForOrganization(planData)
      
      console.log('✅ Step 4 Success:', result)
      setResult(`Step 4 - Plan Selected:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(5)
        console.log('🎉 Registration flow completed! Ready for dashboard.')
      }
    } catch (error) {
      console.error('❌ Step 4 Error:', error)
      setResult(`Step 4 Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Test authentication status
  const testAuthStatus = () => {
    const isAuth = registrationService.isAuthenticated()
    const userData = registrationService.getStoredUserData()
    
    setResult(`Authentication Status: ${isAuth ? '✅ Authenticated' : '❌ Not Authenticated'}\n\nStored Data:\n${JSON.stringify(userData, null, 2)}`)
  }

  // Clear all data
  const clearData = () => {
    registrationService.clearStoredData()
    // Also clear pending data
    localStorage.removeItem('pendingOrgId')
    localStorage.removeItem('pendingOrgName')
    localStorage.removeItem('pendingJoinCode')
    localStorage.removeItem('pendingAdminId')
    localStorage.removeItem('pendingAdminEmail')
    setCurrentStep(1)
    setResult('🧹 All data cleared')
  }

  // Resend OTP test
  const testResendOTP = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing resend admin OTP...')
      
      const result = await registrationService.resendAdminOtp(adminData.workEmail)
      
      console.log('✅ Resend Admin OTP Success:', result)
      setResult(`Resend Admin OTP:\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      console.error('❌ Resend Admin OTP Error:', error)
      setResult(`Resend Admin OTP Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Step-by-Step Registration Flow</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep > step.step 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > step.step ? '✓' : step.step}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= step.step ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ml-4 ${
                  currentStep > step.step ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testStep1CreateOrganization}
          disabled={loading || currentStep !== 1}
          className="bg-blue-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          {loading && currentStep === 1 ? 'Creating...' : 'Step 1: Create Organization'}
        </button>
        
        <button
          onClick={testStep2CreateAdmin}
          disabled={loading || currentStep !== 2}
          className="bg-indigo-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600"
        >
          {loading && currentStep === 2 ? 'Creating...' : 'Step 2: Create Admin'}
        </button>
        
        <button
          onClick={testStep3VerifyOTP}
          disabled={loading || currentStep !== 3}
          className="bg-green-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
        >
          {loading && currentStep === 3 ? 'Verifying...' : 'Step 3: Verify OTP (Use 123456)'}
        </button>
        
        <button
          onClick={testStep4SelectPlan}
          disabled={loading || currentStep !== 4}
          className="bg-purple-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600"
        >
          {loading && currentStep === 4 ? 'Selecting...' : 'Step 4: Select Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => window.location.href = '/test-dashboard'}
          disabled={currentStep !== 5}
          className="bg-yellow-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
        >
          🎉 Step 5: Go to Dashboard
        </button>
      </div>

      {/* Utility Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={testResendOTP}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-orange-600"
        >
          Test Resend Admin OTP
        </button>
        
        <button
          onClick={testAuthStatus}
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          Check Auth Status
        </button>
        
        <button
          onClick={clearData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All Data
        </button>
      </div>

      {/* Test Data Display */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Test Data Being Used:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Organization:</strong>
            <pre className="text-xs mt-1">{JSON.stringify({
              name: orgData.organizationName,
              industry: orgData.industry,
              country: orgData.country,
              currency: orgData.currency
            }, null, 2)}</pre>
          </div>
          <div>
            <strong>Admin:</strong>
            <pre className="text-xs mt-1">{JSON.stringify({
              fullName: adminData.fullName,
              workEmail: adminData.workEmail,
              phone: adminData.phone,
              role: 'owner'
            }, null, 2)}</pre>
          </div>
          <div>
            <strong>Plan:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(planData, null, 2)}</pre>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
          {result || 'No test run yet. Start with Step 1: Create Organization'}
        </pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">New Registration Flow:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Step 1:</strong> Create organization with all details, get unique join code</li>
          <li><strong>Step 2:</strong> Create admin account for that organization, send OTP</li>
          <li><strong>Step 3:</strong> Verify admin email with OTP (use "123456" for testing)</li>
          <li><strong>Step 4:</strong> Select plan and create subscription</li>
          <li><strong>Step 5:</strong> Redirect to dashboard with complete setup</li>
        </ol>
        <p className="mt-2"><strong>Key Changes:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Separate database tables: <code>admins</code>, <code>employees</code>, <code>clients</code></li>
          <li>Step-by-step flow with proper validation at each step</li>
          <li>Organization gets unique join code for employee/client invites</li>
          <li>Admin authentication separate from general users</li>
        </ul>
      </div>
    </div>
  )
}
