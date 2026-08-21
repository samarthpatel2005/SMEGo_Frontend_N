'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface OrganizationInfo {
  name: string
  uniqueCode: string
}

const OrganizationCodePage = () => {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchOrganizationInfo()
  }, [])

  const fetchOrganizationInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/organization/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setOrganization(result.organization)
      } else {
        setError(result.message || 'Failed to fetch organization details')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const employeeJoinUrl = `${window.location.origin}/auth/employee/join`
  const clientJoinUrl = `${window.location.origin}/auth/client/join`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organization Code</h1>
        <p className="text-gray-600 mt-2">
          Share this code with employees and clients to let them join your organization
        </p>
      </div>

      {organization && (
        <div className="space-y-6">
          {/* Organization Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{organization.name}</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Organization Code</p>
                <div className="flex items-center justify-center space-x-4">
                  <code className="text-3xl font-mono font-bold text-blue-600 bg-white px-4 py-2 rounded border">
                    {organization.uniqueCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(organization.uniqueCode)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Join Instructions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employee Instructions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                For Employees
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Employees can join using the organization code:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Visit the employee join page</li>
                  <li>Enter the organization code: <code className="bg-gray-100 px-1 rounded">{organization.uniqueCode}</code></li>
                  <li>Fill in their details</li>
                  <li>Create their account</li>
                </ol>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Employee join URL:</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {employeeJoinUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(employeeJoinUrl)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Instructions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                For Clients
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Clients can join using the organization code:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Visit the client join page</li>
                  <li>Enter the organization code: <code className="bg-gray-100 px-1 rounded">{organization.uniqueCode}</code></li>
                  <li>Fill in their company details</li>
                  <li>Create their account</li>
                </ol>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Client join URL:</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {clientJoinUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(clientJoinUrl)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Security Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Only share this code with trusted individuals. Anyone with this code can request to join your organization.
                  You can also send direct email invitations through the employee and client management dashboards for more control.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizationCodePage
