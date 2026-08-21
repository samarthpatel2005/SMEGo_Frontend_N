// import { EmployeeJoinData } from '@/types/registration'
// import api from "@/lib/axios"
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// export const employeeService = {
//   async joinOrganization(data: EmployeeJoinData) {
//     const payload = {
//       fullName: data.fullName,
//       email: data.workEmail,
//       password: data.password,
//       phone: data.phone,
//       joinCode: data.organizationCode,
//       department: data.department,
//       position: data.position
//     }
//     const res = await fetch(`${API_BASE_URL}/employees/join`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     })
//     return res.json()
//   },

//   async verifyEmployeeOtp(email: string, otp: string) {
//     const res = await fetch(`${API_BASE_URL}/employees/verify-otp`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, otp })
//     })
//     return res.json()
//   },

//   async resendEmployeeOtp(email: string, otp: string) {
//     const res = await fetch(`${API_BASE_URL}/employees/resend-otp`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email })
//     })
//     return res.json()
//   }
// }
import { EmployeeJoinData } from '@/types/registration'
import api from '@/lib/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// ------------------ Types ------------------
export interface Employee {
  _id: string
  employeeId: string
  fullName: string
  email: string
  phone?: string
  organization: {
    _id: string
    name: string
  }
  role: 'manager' | 'employee' | 'hr' | 'accountant'
  department?: string
  position?: string
  salary?: number
  hireDate: string
  isEmailVerified: boolean
  invitedBy?: {
    _id: string
    fullName: string
    email: string
  }
  joinedVia: 'invite' | 'code'
  lastLogin?: string
  isActive: boolean
  modulePermissions: string[]
  createdAt: string
  updatedAt: string
}

export interface EmployeesResponse {
  success: boolean
  data: {
    employees: Employee[]
    pagination: {
      current: number
      pages: number
      total: number
    }
  }
}

export interface EmployeeResponse {
  success: boolean
  data: Employee
}

export interface GetEmployeesParams {
  page?: number
  limit?: number
  search?: string
  department?: string
  role?: string
}

// ------------------ Service ------------------
export const employeeService = {
  // ---------- From first code ----------
  async joinOrganization(data: EmployeeJoinData) {
    const payload = {
      fullName: data.fullName,
      email: data.workEmail,
      password: data.password,
      phone: data.phone,
      joinCode: data.organizationCode,
      department: data.department,
      position: data.position
    }
    const res = await fetch(`${API_BASE_URL}/employees/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return res.json()
  },

  async verifyEmployeeOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/employees/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    })
    return res.json()
  },

  async resendEmployeeOtp(email: string,otp: string) {
    const res = await fetch(`${API_BASE_URL}/employees/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return res.json()
  },

  // ---------- From second code ----------
  async getEmployees(params: GetEmployeesParams = {}): Promise<EmployeesResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.department) searchParams.append('department', params.department)
    if (params.role) searchParams.append('role', params.role)
    
    const queryString = searchParams.toString()
    const url = `/employees${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<EmployeesResponse>(url)
    return response.data
  },

  async getEmployee(id: string): Promise<EmployeeResponse> {
    const response = await api.get<EmployeeResponse>(`/employees/${id}`)
    return response.data
  },

  async getPermissions(id: string): Promise<{ success: boolean; data: { modulePermissions: string[] } }> {
    const response = await api.get(`/employees/${id}/permissions`)
    return response.data
  },

  async updatePermissions(id: string, modulePermissions: string[]): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/employees/${id}/permissions`, { modulePermissions })
    return response.data
  }
}
