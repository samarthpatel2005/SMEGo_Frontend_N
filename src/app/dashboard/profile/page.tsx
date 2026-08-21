'use client'

import DashboardShell from '@/components/layout/DashboardShell'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { getCurrentProfile, updateProfile, ProfileData, isAdmin, isEmployee } from '@/services/profileService'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState({
    fullName: '',
    phone: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError('')
        const profileData = await getCurrentProfile()
        setProfile(profileData)
        setForm({
          fullName: profileData.fullName || '',
          phone: profileData.phone || ''
        })
      } catch (e: any) {
        console.error('Error loading profile:', e)
        setError(e?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined
      }

      const updatedProfile = await updateProfile(payload)
      setProfile(updatedProfile)
      setSuccess('Profile updated successfully!')

      // Update localStorage if user data is stored there
      try {
        const saved = localStorage.getItem('user')
        if (saved) {
          const userData = JSON.parse(saved)
          const updated = { 
            ...userData, 
            fullName: updatedProfile.fullName, 
            phone: updatedProfile.phone 
          }
          localStorage.setItem('user', JSON.stringify(updated))
        }
      } catch (localStorageError) {
        console.warn('Failed to update localStorage:', localStorageError)
      }

    } catch (e: any) {
      console.error('Error updating profile:', e)
      setError(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const formatUserType = (userType: string, role: string) => {
    if (isAdmin({ userType, role } as ProfileData)) {
      return 'Administrator'
    } else if (isEmployee({ userType, role } as ProfileData)) {
      return role.charAt(0).toUpperCase() + role.slice(1)
    }
    return userType.charAt(0).toUpperCase() + userType.slice(1)
  }

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                    {profile?.fullName 
                      ? profile.fullName
                        .split(' ')
                        .map(name => name.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join('')
                      : ''}
                    </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {profile?.fullName || ''}
                  </h1>
                  <p className="text-slate-600 text-lg mt-1">Manage your account information and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">Loading your profile...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 xl:grid-cols-3">
              {/* Profile Information Card - Spans 2 columns on XL screens */}
              <div className="xl:col-span-2">
                <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Profile Information
                    </h3>
                    <p className="text-slate-300 mt-1">Your account details and organizational information</p>
                  </div>
                  
                  <div className="p-8">
                    {profile && (
                      <div className="grid gap-8 sm:grid-cols-2">
                        <div className="space-y-6">
                          <div className="group">
                            <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              User Type
                            </label>
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                              <p className="text-blue-800 font-semibold">{formatUserType(profile.userType, profile.role)}</p>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Email Address
                            </label>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <p className="text-slate-700 font-medium">{profile.email}</p>
                            </div>
                          </div>

                          {profile.employeeId && (
                            <div className="group">
                              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                Employee ID
                              </label>
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <p className="text-purple-800 font-mono font-semibold">{profile.employeeId}</p>
                              </div>
                            </div>
                          )}

                          <div className="group">
                            <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                              Member Since
                            </label>
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                              <p className="text-amber-800 font-semibold">{new Date(profile.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {profile.department && (
                            <div className="group">
                              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                                Department
                              </label>
                              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                                <p className="text-indigo-800 font-semibold">{profile.department}</p>
                              </div>
                            </div>
                          )}

                          {profile.position && (
                            <div className="group">
                              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                                Position
                              </label>
                              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                                <p className="text-teal-800 font-semibold">{profile.position}</p>
                              </div>
                            </div>
                          )}

                          {profile.organization && (
                            <div className="group">
                              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mr-2"></div>
                                Organization
                              </label>
                              <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                                <p className="text-rose-800 font-semibold">{profile.organization.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Edit Profile Form */}
              <div className="xl:col-span-1">
                <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden h-fit sticky top-8">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Profile
                    </h3>
                    <p className="text-green-100 mt-1">Edit your personal information</p>
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={onSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 shadow-sm">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                          </div>
                        </div>
                      )}
                      
                      {success && (
                        <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 shadow-sm">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-5">
                        <div>
                          <Input
                            label="Full Name"
                            name="fullName"
                            value={form.fullName}
                            onChange={onChange}
                            placeholder="Enter your full name"
                            required
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <Input
                            label="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            placeholder="e.g., +1234567890"
                            type="tel"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          disabled={saving || !form.fullName.trim()}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {saving ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving Changes...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}