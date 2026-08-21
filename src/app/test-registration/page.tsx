'use client'

import { registrationService } from '@/services/registrationService'
import { useState } from 'react'
import { OrganizationProfileData, AdminAccountData, PlanSelectionData } from '@/types/registration'

interface RegistrationStep {
  step: number
  title: string
  completed: boolean
}

export default function TestRegistrationPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [steps] = useState<RegistrationStep[]>([
    { step: 1, title: 'Organization Details', completed: false },
    { step: 2, title: 'Admin Account', completed: false },
    { step: 3, title: 'Email Verification', completed: false },
    { step: 4, title: 'Dashboard', completed: false }
  ])

  // Test data
  const [orgData] = useState<OrganizationProfileData>({
    organizationName: 'SMEGo Test Company',
    legalName: 'SMEGo Test Company Pvt Ltd',
    industry: 'Technology',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    address: {
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal: '400001',
      country: 'IN'
    },
    taxId: 'TEST123456789',
    invoicePrefix: 'SME'
  })

  const [adminData] = useState<AdminAccountData>({
    fullName: 'Test Admin User',
    workEmail: 'testadmin@smego.com',
    password: 'Test123456',
    confirmPassword: 'Test123456',
    phone: '+919876543210',
    acceptTerms: true,
    organizationName: 'SMEGo Test Company',
    legalName: 'SMEGo Test Company Pvt Ltd',
    industry: 'Technology',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    address: {
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal: '400001',
      country: 'IN'
    },
    taxId: 'TEST123456789',
    invoiceNumberPrefix: 'SME'
  })

  const [planData] = useState<PlanSelectionData>({
    planId: 'starter',
    usersLimit: 10,
    trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    couponCode: ''
  })

  // Step 1: Create Organization and Admin
  const testStep1CreateOrgAndAdmin = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 1: Creating organization and admin account...')
      
      const result = await registrationService.createOrganizationAndAdmin(
        orgData,
        adminData,
        planData
      )
      
      console.log('✅ Step 1 Success:', result)
      setResult(`Step 1 - Organization and Admin Created:\n${JSON.stringify(result, null, 2)}`)
      
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

  // Step 2: Verify OTP
  const testStep2VerifyOTP = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 2: Verifying OTP...')
      
      // For testing, using a sample OTP - in real scenario, user would enter the OTP from email
      const testOTP = '123456' // This should be the OTP received in email
      
      const result = await registrationService.verifyEmailOtp(adminData.workEmail, testOTP)
      
      console.log('✅ Step 2 Success:', result)
      setResult(`Step 2 - OTP Verified:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(3)
        // Check if we have authentication data
        const userData = registrationService.getStoredUserData()
        console.log('📱 Stored user data after verification:', userData)
      }
    } catch (error) {
      console.error('❌ Step 2 Error:', error)
      setResult(`Step 2 Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Get Complete Profile (Simulate Dashboard Data Loading)
  const testStep3GetProfile = async () => {
    setLoading(true)
    try {
      console.log('🧪 Step 3: Getting complete user profile...')
      
      const result = await registrationService.getUserProfile()
      
      console.log('✅ Step 3 Success:', result)
      setResult(`Step 3 - Complete Profile:\n${JSON.stringify(result, null, 2)}`)
      
      if (result.success) {
        setCurrentStep(4)
        console.log('🎉 Registration flow completed! Ready for dashboard.')
      }
    } catch (error) {
      console.error('❌ Step 3 Error:', error)
      setResult(`Step 3 Error: ${error instanceof Error ? error.message : String(error)}`)
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
    setCurrentStep(1)
    setResult('🧹 All data cleared')
  }

  // Resend OTP test
  const testResendOTP = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing resend OTP...')
      
      const result = await registrationService.resendOtp(adminData.workEmail)
      
      console.log('✅ Resend OTP Success:', result)
      setResult(`Resend OTP:\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      console.error('❌ Resend OTP Error:', error)
      setResult(`Resend OTP Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Check organizations in database
  const testListOrganizations = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing list organizations...')
      
      const result = await registrationService.debugListOrganizations()
      
      console.log('✅ Organizations list:', result)
      setResult(`Organizations in Database:\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      console.error('❌ List organizations error:', error)
      setResult(`List Organizations Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Complete Registration Flow Test</h1>
      
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
                <div className={`w-16 h-0.5 ml-4 ${
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
          onClick={testStep1CreateOrgAndAdmin}
          disabled={loading || currentStep !== 1}
          className="bg-blue-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          {loading && currentStep === 1 ? 'Creating...' : 'Step 1: Create Org & Admin'}
        </button>
        
        <button
          onClick={testStep2VerifyOTP}
          disabled={loading || currentStep !== 2}
          className="bg-green-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
        >
          {loading && currentStep === 2 ? 'Verifying...' : 'Step 2: Verify OTP (Use 123456)'}
        </button>
        
        <button
          onClick={testStep3GetProfile}
          disabled={loading || currentStep !== 3}
          className="bg-purple-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600"
        >
          {loading && currentStep === 3 ? 'Loading...' : 'Step 3: Get Complete Profile'}
        </button>
        
        <button
          onClick={() => window.location.href = '/test-dashboard'}
          disabled={currentStep !== 4}
          className="bg-yellow-500 text-white px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"
        >
          🎉 Go to Dashboard
        </button>
      </div>

      {/* Utility Buttons */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={testResendOTP}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-orange-600"
        >
          Test Resend OTP
        </button>
        
        <button
          onClick={testAuthStatus}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Check Auth Status
        </button>
        
        <button
          onClick={testListOrganizations}
          disabled={loading}
          className="bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-teal-600"
        >
          List All Organizations
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
            <pre className="text-xs mt-1">{JSON.stringify(orgData, null, 2)}</pre>
          </div>
          <div>
            <strong>Admin User:</strong>
            <pre className="text-xs mt-1">{JSON.stringify({
              fullName: adminData.fullName,
              workEmail: adminData.workEmail,
              phone: adminData.phone,
              role: 'owner'
            }, null, 2)}</pre>
          </div>
          <div>
            <strong>Plan Selection:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(planData, null, 2)}</pre>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
          {result || 'No test run yet. Start with Step 1: Create Org & Admin'}
        </pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Step 1:</strong> Creates organization with actual data and admin user, sends OTP email</li>
          <li><strong>Step 2:</strong> Verifies OTP (use "123456" for testing), completes registration, stores tokens</li>
          <li><strong>Step 3:</strong> Loads complete user profile with organization and subscription data</li>
          <li><strong>Dashboard:</strong> User is now authenticated and can access the dashboard</li>
        </ol>
        <p className="mt-2"><strong>Note:</strong> Check browser console and backend logs for detailed information. Open browser DevTools to see network requests and stored data.</p>
      </div>
    </div>
  )
}
