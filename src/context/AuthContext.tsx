'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // TODO: Validate token with backend
          const mockUser: User = {
            id: '1',
            email: 'john@example.com',
            name: 'John Doe',
            role: 'admin',
            organizationId: 'org-1'
          }
          setUser(mockUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    window.location.href = '/auth/login'
  }

  const register = async (userData: any) => {
    try {
      // TODO: Implement actual registration API call
      console.log('Registering user:', userData)
      
      // Mock registration success
      const mockUser: User = {
        id: '1',
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: 'admin',
        organizationId: 'org-1'
      }
      
  setUser(mockUser)
  localStorage.setItem('token', 'mock-token')
  localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    register
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
