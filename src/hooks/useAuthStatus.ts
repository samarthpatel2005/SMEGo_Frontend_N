import { useEffect, useState } from 'react'
import { registrationService } from '@/services/registrationService'

export interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  user: any | null
  organization: any | null
  subscription: any | null
  token: string | null
}

export function useAuthStatus(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    user: null,
    organization: null,
    subscription: null,
    token: null
  })

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const isAuth = registrationService.isAuthenticated()
        const userData = registrationService.getStoredUserData()
        
        setAuthState({
          isAuthenticated: isAuth,
          loading: false,
          user: userData.user,
          organization: userData.organization,
          subscription: userData.subscription,
          token: userData.token
        })
      } catch (error) {
        console.error('Error checking auth status:', error)
        setAuthState({
          isAuthenticated: false,
          loading: false,
          user: null,
          organization: null,
          subscription: null,
          token: null
        })
      }
    }

    checkAuthStatus()

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return authState
}

// Helper hook for redirecting unauthenticated users
export function useRequireAuth() {
  const authState = useAuthStatus()

  useEffect(() => {
    if (!authState.loading && !authState.isAuthenticated) {
      // Redirect to registration or login page
      window.location.href = '/test-registration'
    }
  }, [authState.loading, authState.isAuthenticated])

  return authState
}
