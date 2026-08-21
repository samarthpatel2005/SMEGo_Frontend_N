import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Types
export interface Employee {
  _id: string
  fullName: string
  email: string
  employeeId: string
  department: string
  position: string
  isActive: boolean
}

export interface Timesheet {
  _id: string
  employee: Employee
  date: string
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'leave' | 'half-day'
  attendanceType: 'present' | 'absent' | 'leave' | 'half-day'
  hoursWorked: number
  notes?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
}

export interface TimesheetFilters {
  date?: string
  year?: number
  month?: number
  employeeId?: string
  status?: string
  page?: number
  limit?: number
}

export interface CreateTimesheetRequest {
  employeeId: string
  date: string
  attendanceType: 'present' | 'absent' | 'leave' | 'half_day'
  checkIn?: string
  checkOut?: string
  notes?: string
  leaveType?: string
}

// Create axios instance with auth
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token')
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}

export const timesheetService = {
  // Get timesheets with filters
  getTimesheets: async (filters: TimesheetFilters = {}) => {
    try {
      const api = createAuthenticatedRequest()
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await api.get(`/timesheets?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching timesheets:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheets')
    }
  },

  // Get single timesheet
  getTimesheet: async (id: string) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.get(`/timesheets/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheet')
    }
  },

  // Create timesheet (mark attendance)
  createTimesheet: async (data: CreateTimesheetRequest) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post('/timesheets', data)
      return response.data
    } catch (error: any) {
      console.error('Error creating timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to create timesheet')
    }
  },

  // Update timesheet
  updateTimesheet: async (id: string, data: Partial<CreateTimesheetRequest>) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put(`/timesheets/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to update timesheet')
    }
  },

  // Delete timesheet
  deleteTimesheet: async (id: string) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.delete(`/timesheets/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete timesheet')
    }
  },

  // Check in
  checkIn: async () => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post('/timesheets/checkin')
      return response.data
    } catch (error: any) {
      console.error('Error checking in:', error)
      throw new Error(error.response?.data?.message || 'Failed to check in')
    }
  },

  // Check out
  checkOut: async () => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post('/timesheets/checkout')
      return response.data
    } catch (error: any) {
      console.error('Error checking out:', error)
      throw new Error(error.response?.data?.message || 'Failed to check out')
    }
  },

  // Get my timesheets (for employees)
  getMyTimesheets: async (filters: TimesheetFilters = {}) => {
    try {
      const api = createAuthenticatedRequest()
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await api.get(`/timesheets/my-timesheets?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching my timesheets:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch my timesheets')
    }
  },

  // Update my timesheet (for employees)
  updateMyTimesheet: async (id: string, data: Partial<CreateTimesheetRequest>) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put(`/timesheets/my-timesheet/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating my timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to update my timesheet')
    }
  },

  // Approve timesheet (for managers/admin)
  approveTimesheet: async (id: string, notes?: string) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post(`/timesheets/${id}/approve`, { notes })
      return response.data
    } catch (error: any) {
      console.error('Error approving timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to approve timesheet')
    }
  },

  // Reject timesheet (for managers/admin)
  rejectTimesheet: async (id: string, reason: string) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post(`/timesheets/${id}/reject`, { reason })
      return response.data
    } catch (error: any) {
      console.error('Error rejecting timesheet:', error)
      throw new Error(error.response?.data?.message || 'Failed to reject timesheet')
    }
  },

  // Get timesheet summary
  getTimesheetSummary: async (filters: TimesheetFilters = {}) => {
    try {
      const api = createAuthenticatedRequest()
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await api.get(`/timesheets/summary?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching timesheet summary:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheet summary')
    }
  },

  // Bulk create timesheets
  bulkCreateTimesheets: async (timesheets: CreateTimesheetRequest[]) => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post('/timesheets/bulk-create', { timesheets })
      return response.data
    } catch (error: any) {
      console.error('Error bulk creating timesheets:', error)
      throw new Error(error.response?.data?.message || 'Failed to bulk create timesheets')
    }
  },

  // Export timesheets as CSV
  exportTimesheetsCSV: async (filters: TimesheetFilters = {}) => {
    try {
      const api = createAuthenticatedRequest()
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await api.get(`/timesheets/export/csv?${queryParams.toString()}`, {
        responseType: 'blob'
      })

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `timesheets-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true, message: 'Export downloaded successfully' }
    } catch (error: any) {
      console.error('Error exporting timesheets:', error)
      throw new Error(error.response?.data?.message || 'Failed to export timesheets')
    }
  }
}
