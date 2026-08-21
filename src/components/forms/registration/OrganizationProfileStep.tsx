'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { COUNTRIES, CURRENCIES, generateJoinCode } from '@/lib/registration'
import { INDUSTRIES, OrganizationProfileData, ValidationErrors } from '@/types/registration'
import React, { useEffect, useState } from 'react'

interface OrganizationProfileStepProps {
  data: OrganizationProfileData
  onChange: (data: OrganizationProfileData) => void
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
}

const OrganizationProfileStep: React.FC<OrganizationProfileStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([])

  // Update timezones and currency when country changes
  useEffect(() => {
    if (data.country) {
      const selectedCountry = COUNTRIES.find(c => c.code === data.country)
      if (selectedCountry) {
        setAvailableTimezones(selectedCountry.timezones)
        if (!data.timezone || !selectedCountry.timezones.includes(data.timezone)) {
          onChange({
            ...data,
            timezone: selectedCountry.timezones[0],
            currency: selectedCountry.currency
          })
        }
      }
    }
  }, [data.country])

  // Generate join code if not present
  useEffect(() => {
    if (!data.joinCode) {
      onChange({
        ...data,
        joinCode: generateJoinCode()
      })
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Organization name validation
    if (!data.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required'
    } else if (data.organizationName.trim().length < 2 || data.organizationName.trim().length > 100) {
      newErrors.organizationName = 'Organization name must be between 2 and 100 characters'
    }

    // Country validation
    if (!data.country) {
      newErrors.country = 'Country is required'
    }

    // Currency validation
    if (!data.currency) {
      newErrors.currency = 'Currency is required'
    }

    // Timezone validation
    if (!data.timezone) {
      newErrors.timezone = 'Timezone is required'
    }

    // Tax ID validation (optional but if provided, should have basic format)
    if (data.taxId && data.taxId.trim()) {
      if (data.taxId.trim().length < 5) {
        newErrors.taxId = 'Tax ID seems too short'
      }
    }

    // Terms and conditions validation
    if (!data.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy'
    }

    // Invoice prefix validation (optional but if provided, should be reasonable)
    if (data.invoicePrefix && data.invoicePrefix.trim()) {
      if (!/^[A-Z0-9]{2,10}$/.test(data.invoicePrefix.trim())) {
        newErrors.invoicePrefix = 'Invoice prefix should be 2-10 uppercase letters/numbers'
      }
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

  const handleChange = (field: keyof OrganizationProfileData, value: any) => {
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

  const handleAddressChange = (field: string, value: string) => {
    onChange({
      ...data,
      address: {
        ...data.address,
        [field]: value
      }
    })
  }

  const regenerateJoinCode = () => {
    handleChange('joinCode', generateJoinCode())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Organization Setup</h1>
              <p className="mt-2 text-sm text-slate-600">Configure your organization profile and business settings</p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                {/* <div className="w-2 h-2 bg-blue-600 rounded-full"></div> */}
                {/* <span>Step 2 of 3</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Company Information</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Input
                      label="Organization Name"
                      type="text"
                      required
                      value={data.organizationName}
                      onChange={(e) => handleChange('organizationName', e.target.value)}
                      error={errors.organizationName}
                      placeholder="Enter your organization name"
                      className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500">This will be displayed on invoices and documents</p>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="Legal Name"
                      type="text"
                      value={data.legalName || ''}
                      onChange={(e) => handleChange('legalName', e.target.value)}
                      placeholder="Full legal entity name"
                      className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500">Optional: Official registered business name</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Select
                    label="Industry"
                    value={data.industry || ''}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    placeholder="Select your industry"
                    options={INDUSTRIES.map(industry => ({ value: industry, label: industry }))}
                    className="text-slate-900"
                  />

                  <Select
                    label="Country"
                    required
                    value={data.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    error={errors.country}
                    placeholder="Select your country"
                    options={COUNTRIES.map(country => ({ value: country.code, label: country.name }))}
                    className="text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Regional Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Regional Settings</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Select
                    label="Timezone"
                    required
                    value={data.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    error={errors.timezone}
                    placeholder="Select timezone"
                    options={availableTimezones.map(tz => ({ value: tz, label: tz.replace('_', ' ') }))}
                    className="text-slate-900"
                  />

                  <Select
                    label="Default Currency"
                    required
                    value={data.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    error={errors.currency}
                    placeholder="Select currency"
                    options={CURRENCIES.map(currency => ({ 
                      value: currency.code, 
                      label: `${currency.code} - ${currency.name} (${currency.symbol})` 
                    }))}
                    className="text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Business Address</h2>
                  <span className="text-emerald-200 text-sm bg-emerald-600 bg-opacity-30 px-2 py-1 rounded-full">Optional</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Street Address"
                    type="text"
                    value={data.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Business Street, Suite 100"
                    className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    type="text"
                    value={data.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="New York"
                    className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />

                  <Input
                    label="State/Province"
                    type="text"
                    value={data.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="NY"
                    className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />

                  <Input
                    label="Postal Code"
                    type="text"
                    value={data.address?.postal || ''}
                    onChange={(e) => handleAddressChange('postal', e.target.value)}
                    placeholder="10001"
                    className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Configuration Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Business Configuration</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Input
                      label="Tax ID (GST/VAT)"
                      type="text"
                      value={data.taxId || ''}
                      onChange={(e) => handleChange('taxId', e.target.value)}
                      error={errors.taxId}
                      placeholder="GST123456789"
                      className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-slate-500">Optional: Your tax identification number</p>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="Invoice Number Prefix"
                      type="text"
                      value={data.invoicePrefix || ''}
                      onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                      error={errors.invoicePrefix}
                      placeholder="INV"
                      className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-slate-500">Optional: Prefix for invoice numbers (e.g., INV-001)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Agreement Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={data.acceptTerms || false}
                      onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="acceptTerms" className="block text-sm text-slate-700 leading-relaxed">
                      I acknowledge that I have read, understood, and agree to be bound by the{' '}
                      <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2">
                        Privacy Policy
                      </a>.
                      By checking this box, I confirm that I have the authority to bind my organization to these terms.
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{errors.acceptTerms}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 h-12 text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Step
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading || !data.acceptTerms || !data.organizationName.trim() || !data.country || !data.currency || !data.timezone}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting up...
                    </>
                  ) : (
                    <>
                      Continue Setup
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  All information is securely encrypted and stored. You can modify these settings later from your dashboard.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrganizationProfileStep