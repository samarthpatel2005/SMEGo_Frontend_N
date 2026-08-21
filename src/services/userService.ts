import axios from '@/lib/axios'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  organizationId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: string
  organizationId: string
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Types aligned with backend user profile
export interface UserProfile {
  _id: string
  fullName: string
  email: string
  phone?: string
  role?: string
  organization?: any
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfilePayload {
  fullName?: string
  phone?: string
  password?: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        return data.users || []
      }
      
      throw new Error('Failed to fetch users')
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
  return data.user || data.data || null
      }
      
      return null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }
      
      throw new Error('Failed to create user')
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
  return data.user || data.data
      }
      
      throw new Error('Failed to update user')
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Get users by organization
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE}/organizations/${organizationId}/users`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        return data.users || []
      }
      
      throw new Error('Failed to fetch organization users')
    } catch (error) {
      console.error('Error fetching organization users:', error)
      throw error
    }
  },


  // Get own profile (aligned with backend: returns { success, data })
  async getMyProfile(id: string): Promise<UserProfile> {
    const res = await axios.get(`/users/${id}`)
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch profile')
    return res.data.data as UserProfile
  },

  // Update own profile
  async updateMyProfile(id: string, payload: UpdateProfilePayload): Promise<{ user: UserProfile; message?: string }> {
    const res = await axios.put(`/users/${id}`, payload)
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to update profile')
    return { user: res.data.data as UserProfile, message: res.data.message }
  }
}
