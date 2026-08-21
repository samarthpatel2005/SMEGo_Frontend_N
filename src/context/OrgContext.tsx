'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface Organization {
  id: string
  name: string
  address: string
  taxId: string
  planId: string
  settings: {
    currency: string
    timezone: string
    dateFormat: string
  }
}

interface OrgContextType {
  organization: Organization | null
  isLoading: boolean
  updateOrganization: (orgData: Partial<Organization>) => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
}

export const OrgContext = createContext<OrgContextType | undefined>(undefined)

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load organization data
    const loadOrganization = async () => {
      try {
        // TODO: Fetch from API
        const mockOrg: Organization = {
          id: 'org-1',
          name: 'SME Operations Inc',
          address: '123 Business St, Suite 100\nNew York, NY 10001',
          taxId: '12-3456789',
          planId: 'professional',
          settings: {
            currency: 'USD',
            timezone: 'America/New_York',
            dateFormat: 'MM/DD/YYYY'
          }
        }
        setOrganization(mockOrg)
      } catch (error) {
        console.error('Failed to load organization:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrganization()
  }, [])

  const updateOrganization = async (orgData: Partial<Organization>) => {
    try {
      // TODO: Implement API call to update organization
      console.log('Updating organization:', orgData)
      
      setOrganization(prev => prev ? { ...prev, ...orgData } : null)
    } catch (error) {
      throw error
    }
  }

  const switchOrganization = async (orgId: string) => {
    try {
      setIsLoading(true)
      // TODO: Implement API call to switch organization
      console.log('Switching to organization:', orgId)
      
      // Mock data for different organization
      const mockOrg: Organization = {
        id: orgId,
        name: 'Another Company',
        address: '456 Another St\nBoston, MA 02101',
        taxId: '98-7654321',
        planId: 'starter',
        settings: {
          currency: 'USD',
          timezone: 'America/New_York',
          dateFormat: 'DD/MM/YYYY'
        }
      }
      setOrganization(mockOrg)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    organization,
    isLoading,
    updateOrganization,
    switchOrganization
  }

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
