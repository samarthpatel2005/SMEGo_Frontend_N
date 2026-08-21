'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { validateConfirmPassword, validateEmail, validateName, validatePassword, validatePhone } from '@/lib/registration'
import { AdminAccountData, ValidationErrors } from '@/types/registration'
import React, { useState } from 'react'
import OtpVerification from './OtpVerification'

interface AdminAccountStepProps {
  data: AdminAccountData
  onChange: (data: AdminAccountData) => void
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
  showOtpVerification?: boolean
  onOtpVerified?: () => void
}

const AdminAccountStep: React.FC<AdminAccountStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  isLoading = false,
  showOtpVerification = false,
  onOtpVerified
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({})

  // If showing OTP verification, render that instead
  if (showOtpVerification) {
    return (
      <OtpVerification
        email={data.workEmail}
        onVerified={onOtpVerified || onNext}
        onBack={() => {
          // Go back to the form (hide OTP verification)
          if (onOtpVerified) {
            onChange({ ...data }) // Trigger parent to hide OTP
          }
        }}
      />
    )
  }
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Full name validation
    const nameError = validateName(data.fullName, 'Full name')
    if (nameError) newErrors.fullName = nameError

    // Email validation
    const emailError = validateEmail(data.workEmail)
    if (emailError) newErrors.workEmail = emailError

    // Password validation
    const passwordError = validatePassword(data.password)
    if (passwordError) newErrors.password = passwordError

    // Confirm password validation
    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword)
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    // Phone validation (optional but if provided, must be valid)
    const phoneError = validatePhone(data.phone || '')
    if (phoneError) newErrors.phone = phoneError

    // Terms acceptance validation
    if (!data.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms & Privacy Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  const handleChange = (field: keyof AdminAccountData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    })
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h2>
        <p className="text-lg text-gray-600">Set up your administrator account to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          required
          value={data.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="John Doe"
        />

        <Input
          label="Work Email"
          type="email"
          required
          value={data.workEmail}
          onChange={(e) => handleChange('workEmail', e.target.value)}
          error={errors.workEmail}
          placeholder="john@company.com"
        />

        <Input
          label="Password"
          type="password"
          required
          value={data.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          placeholder="Create a strong password"
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          value={data.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          value={data.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="+1234567890"
        />

        <div className="space-y-2">
          <div className="flex items-start">
            <input
              id="accept-terms"
              type="checkbox"
              checked={data.acceptTerms}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="accept-terms" className="ml-3 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="/legal/terms" target="_blank" className="text-blue-600 hover:text-blue-500 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/legal/privacy" target="_blank" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600 ml-7">{errors.acceptTerms}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isLoading ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          After creating your account, we'll send you an email verification link.
        </p>
      </div>
    </div>
  )        <div className="mt-8 text-center">
          <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-200/50">
            <p className="text-sm text-blue-700">
              🔒 After creating your account, we'll send you an email verification link for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAccountStep
