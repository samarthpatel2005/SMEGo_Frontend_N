'use client'

import { useRequireAuth } from '@/hooks/useAuthStatus'
import { registrationService } from '@/services/registrationService'
import { useState, useEffect } from 'react'

export default function TestDashboardPage() {
  const authState = useRequireAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCompleteProfile = async () => {
      if (!authState.loading && authState.isAuthenticated) {
        try {
          // Get the latest profile data from server
          const result = await registrationService.getUserProfile()
          if (result.success) {
            setProfileData(result.data)
          }
        } catch (error) {
          console.error('Failed to load profile:', error)
          // Use local storage data as fallback
          const localData = registrationService.getStoredUserData()
          setProfileData({
            user: localData.user,
            organization: localData.organization,
            subscription: localData.subscription
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadCompleteProfile()
  }, [authState.loading, authState.isAuthenticated])

  const handleLogout = () => {
    registrationService.clearStoredData()
    window.location.href = '/test-registration'
  }

  if (authState.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return null // useRequireAuth will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.organization?.name || 'SMEGo Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profileData?.user?.fullName || authState.user?.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">
                  🎉 Registration Completed Successfully!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Your organization has been created, admin account is verified, and you're ready to start using SMEGo.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* User Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  User Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-sm text-gray-900">{profileData?.user?.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{profileData?.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-sm text-gray-900">{profileData?.user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <p className="text-sm text-gray-900 capitalize">{profileData?.user?.role}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Email Verified:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData?.user?.isEmailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profileData?.user?.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Organization Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Organization Name:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Legal Name:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.legalName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Industry:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Country:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.country}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Currency:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.currency}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tax ID:</span>
                    <p className="text-sm text-gray-900">{profileData?.organization?.taxId || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Subscription Details
                </h3>
                {profileData?.subscription ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Plan:</span>
                      <p className="text-sm text-gray-900">{profileData.subscription.plan?.displayName || profileData.subscription.plan?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profileData.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        profileData.subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profileData.subscription.status === 'trialing' ? '🎁 Trial Active' : 
                         profileData.subscription.status.charAt(0).toUpperCase() + profileData.subscription.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Price:</span>
                      <p className="text-sm text-gray-900">
                        {profileData.subscription.plan?.currency} {profileData.subscription.plan?.price} / {profileData.subscription.plan?.interval}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Trial End:</span>
                      <p className="text-sm text-gray-900">
                        {profileData.subscription.endDate ? new Date(profileData.subscription.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {profileData.subscription.plan?.features && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Features:</span>
                        <ul className="text-sm text-gray-900 list-disc list-inside mt-1">
                          {profileData.subscription.plan.features.map((feature: string, index: number) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No subscription found</p>
                    <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                      Choose a Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Invite Team Members
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add Clients
                </button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Create Invoice
                </button>
                <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                  View Reports
                </button>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="mt-8 bg-gray-50 rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <details>
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  🔍 Debug Information (Click to expand)
                </summary>
                <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    authState: {
                      isAuthenticated: authState.isAuthenticated,
                      hasToken: !!authState.token,
                      hasUser: !!authState.user,
                      hasOrganization: !!authState.organization
                    },
                    profileData: profileData
                  }, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
