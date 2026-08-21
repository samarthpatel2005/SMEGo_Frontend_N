'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { employeeService } from '@/services/employeeService'
import { useState } from 'react'

interface EmployeeOtpVerificationProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export default function EmployeeOtpVerification({ email, onVerified, onBack }: EmployeeOtpVerificationProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await employeeService.verifyEmployeeOtp(email, otp)
      if (result.success) {
        const token = result.data?.token
        const employee = result.data?.employee

        if (token && employee) {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify({
            id: employee.id,
            fullName: employee.fullName,
            email: employee.email,
            role: employee.role,
            organization: result.data?.organization?.name || '',
            organizationId: result.data?.organization?.id || '',
            userType: 'employee',
            department: employee.department,
            position: employee.position
          }))
        }

        onVerified()
      } else {
        setError(result.message || 'Verification failed')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setError('')
    try {
      const result = await employeeService.resendEmployeeOtp(email,otp)
      if (result.success) {
        setResendCooldown(60)
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message || 'Failed to resend OTP')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setError('')
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit code"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn't receive the code?
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleResendOtp}
          disabled={resendLoading || resendCooldown > 0}
          className="mr-3"
        >
          {resendLoading ? 'Sending...' :
           resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
           'Resend Code'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
        >
          Back
        </Button>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        The verification code expires in 10 minutes
      </div>
    </div>
  )
}
