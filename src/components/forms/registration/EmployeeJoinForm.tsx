'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { employeeService } from '@/services/employeeService'
import { EmployeeJoinData, ValidationErrors } from '@/types/registration'
import React, { useState } from 'react'
import EmployeeOtpVerification from './EmployeeOtpVerification'

interface EmployeeJoinFormProps {
  onSubmit: (data: EmployeeJoinData) => Promise<void>
  onBack: () => void
  isLoading: boolean
}

const EmployeeJoinForm: React.FC<EmployeeJoinFormProps> = ({
  onSubmit,
  onBack,
  isLoading
}) => {
  const [formData, setFormData] = useState<EmployeeJoinData>({
    fullName: '',
    workEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    organizationCode: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    if (!formData.organizationCode) newErrors.organizationCode = 'Organization code is required'
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.workEmail) newErrors.workEmail = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      const res = await employeeService.joinOrganization(formData)
      if (res.success) {
        setPendingEmail(formData.workEmail)
        setStep('otp')
      } else {
        setErrors({ general: res.message || 'Failed to join organization' })
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to join organization' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof EmployeeJoinData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (step === 'otp' && pendingEmail) {
    return (
      <EmployeeOtpVerification
        email={pendingEmail}
        onVerified={() => window.location.href = '/dashboard'}
        onBack={() => setStep('form')}
      />
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <p className="text-sm text-red-600 text-center">{errors.general}</p>
        )}

        {/* Organization Code */}
        <Input
          label="Organization Code"
          type="text"
          required
          value={formData.organizationCode}
          onChange={(e) => handleChange('organizationCode', e.target.value.toUpperCase())}
          error={errors.organizationCode}
          placeholder="AB2K7Q"
          maxLength={8}
        />

        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="John Doe"
        />

        {/* Work Email */}
        <Input
          label="Work Email"
          type="email"
          required
          value={formData.workEmail}
          onChange={(e) => handleChange('workEmail', e.target.value)}
          error={errors.workEmail}
          placeholder="john@company.com"
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          placeholder="Create a strong password"
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />

        {/* Phone */}
        <Input
          label="Phone Number (Optional)"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="+1234567890"
        />

        {/* Accept Terms */}
        <div className="flex items-start">
          <input
            id="accept-terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleChange('acceptTerms', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
          />
          <label htmlFor="accept-terms" className="ml-3 block text-sm text-gray-900">
            I agree to the{' '}
            <a href="/legal/terms" target="_blank" className="text-blue-600 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" target="_blank" className="text-blue-600 underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600 ml-7">{errors.acceptTerms}</p>
        )}

        {/* Buttons */}
        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
          >
            {loading ? 'Joining...' : 'Join Organization'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeJoinForm
