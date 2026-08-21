interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  fullName: string
  email: string
  password: string
  phone?: string
  acceptedTerms: boolean
}

interface User {
  id: string
  fullName: string
  email: string
  role: string
  organization: string
  organizationId: string
}

interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    token?: string
    user?: User
    userId?: string
    organizationId?: string
    needsEmailVerification?: boolean
    organization?: {
      id: string
      name: string
      logo?: string
    }
    role?: string
    email?: string
    planInfo?: {
      name: string
      usageInfo: string
    }
  }
  error?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }
      
      return data
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  },

  // Register new user (for admin account creation)
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/createAdminAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      
      // Note: Admin registration doesn't immediately return a token
      // User needs to verify email first
      
      return data
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/verifyEmail/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      // Try to get user from localStorage first
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        return JSON.parse(savedUser)
      }

      // If not in localStorage, fetch from API
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
          return data.data.user
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    return !!token
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token')
  },

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.token) {
          localStorage.setItem('token', data.token)
          return data.token
        }
      }
      
      return null
    } catch (error) {
      console.error('Error refreshing token:', error)
      return null
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }
}
