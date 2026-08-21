import axiosInstance from '@/lib/axios'

export interface ProfileData {
  id: string
  employeeId?: string
  fullName: string
  email: string
  phone?: string | null
  role: string
  department?: string | null
  position?: string | null
  organization?: {
    id: string
    name: string
  }
  userType: 'admin' | 'employee' | 'user'
  modulePermissions?: string[]
  createdAt: string
}

export interface UpdateProfileData {
  fullName?: string
  phone?: string
}

export interface ProfileResponse {
  success: boolean
  message: string
  data: ProfileData
  error?: string
}

// Get current user profile (works for both admin and employee)
export const getCurrentProfile = async (): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/profile/me')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch profile')
  } catch (error: any) {
    console.error('Error fetching current profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch profile')
  }
}

// Get admin profile
export const getAdminProfile = async (): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/profile/admin')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch admin profile')
  } catch (error: any) {
    console.error('Error fetching admin profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch admin profile')
  }
}

// Get employee profile
export const getEmployeeProfile = async (): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/profile/employee')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch employee profile')
  } catch (error: any) {
    console.error('Error fetching employee profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch employee profile')
  }
}

// Update admin profile
export const updateAdminProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.put<ProfileResponse>('/profile/admin', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to update admin profile')
  } catch (error: any) {
    console.error('Error updating admin profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to update admin profile')
  }
}

// Update employee profile
export const updateEmployeeProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.put<ProfileResponse>('/profile/employee', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to update employee profile')
  } catch (error: any) {
    console.error('Error updating employee profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to update employee profile')
  }
}

// Generic update profile function that detects user type
export const updateProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
  try {
    // First get current profile to determine user type
    const currentProfile = await getCurrentProfile()
    
    // Update based on user type
    if (currentProfile.userType === 'admin' || currentProfile.role === 'owner') {
      return await updateAdminProfile(data)
    } else {
      return await updateEmployeeProfile(data)
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile')
  }
}

// Utility function to check if user is admin
export const isAdmin = (profile: ProfileData): boolean => {
  return profile.userType === 'admin' || profile.role === 'owner' || profile.role === 'admin'
}

// Utility function to check if user is employee
export const isEmployee = (profile: ProfileData): boolean => {
  return profile.userType === 'employee' || 
         ['employee', 'manager', 'hr', 'accountant'].includes(profile.role)
}