import axiosInstance from '@/lib/axios'

export interface OrganizationInfo {
  id: string
  name: string
  joinCode: string
  address?: string
  taxId?: string
  country: string
  timezone: string
  currency: string
  settings?: {
    currency: string
    timezone: string
    dateFormat: string
  }
}

// Get current user's organization
export const getCurrentOrganization = async (): Promise<OrganizationInfo> => {
  try {
    const response = await axiosInstance.get('/organization/current')
    return response.data.organization
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch organization')
  }
}

// Update organization
export const updateOrganization = async (orgData: Partial<OrganizationInfo>): Promise<OrganizationInfo> => {
  try {
    const response = await axiosInstance.put('/organization/update', orgData)
    return response.data.organization
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update organization')
  }
}
