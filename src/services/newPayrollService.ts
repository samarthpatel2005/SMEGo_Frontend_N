import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with auth token
const createAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  return {}
}

// Types
export interface Employee {
  _id: string
  fullName: string
  email: string
  employeeId: string
  department: string
  position: string
  salary: number
  salaryType: 'monthly' | 'hourly'
  hourlyRate?: number
  hireDate: string
}

export interface AttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  halfDays: number
  regularHours: number
  overtimeHours: number
  totalHours: number
}

export interface PayrollData {
  employee: string
  organization: string
  payrollPeriod: { month: number; year: number }
  salaryType: string
  baseSalary: number
  hourlyRate?: number
  workingDays: {
    total: number
    present: number
    absent: number
    leave: number
    halfDay: number
  }
  hours: {
    regularHours: number
    overtimeHours: number
    totalHours: number
  }
  earnings: {
    basicSalary: number
    overtimePay: number
    allowances: {
      transportation: number
      food: number
      medical: number
      housing: number
      other: number
    }
    bonus: number
    grossSalary: number
  }
  deductions: {
    tax: number
    socialSecurity: number
    insurance: number
    leaveDeduction: number
    lateDeduction: number
    other: number
    totalDeductions: number
  }
  netSalary: number
}

export interface EmployeeWithPayroll {
  employee: Employee
  attendance: AttendanceSummary
  payrollData: PayrollData
  hasExistingPayroll: boolean
  existingPayrollId?: string
  payrollStatus: string
}

export interface GeneratePayrollRequest {
  year: number
  month: number
  employeeIds: string[]
}

export interface CreatePaymentRequest {
  payrollIds: string[]
  customAmount?: number
}

export interface PaymentResponse {
  success: boolean
  data: {
    orderId: string
    amount: number
    currency: string
    payrolls: Array<{
      _id: string
      employee: Employee
      amount: number
    }>
  }
  message?: string
}

class NewPayrollService {
  async getEmployeesForPayroll(year: number, month: number): Promise<{ 
    success: boolean; 
    data: { employees: EmployeeWithPayroll[]; period: { year: number; month: number } }; 
    message?: string 
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll/employees`, {
        params: { year, month },
        headers: createAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching employees for payroll:', error)
      throw error.response?.data || error.message
    }
  }

  async generatePayrollForEmployees(request: GeneratePayrollRequest): Promise<{
    success: boolean;
    data: any[];
    message: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payroll/generate-for-employees`,
        request,
        { headers: createAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error('Error generating payroll:', error)
      throw error.response?.data || error.message
    }
  }

  async createPayrollPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payroll/create-payment`,
        request,
        { headers: createAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error('Error creating payment:', error)
      throw error.response?.data || error.message
    }
  }

  async getPayrolls(filters?: { year?: number; month?: number; status?: string; page?: number; limit?: number }): Promise<{
    success: boolean;
    data: {
      payrolls: any[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    };
    message?: string;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll`, {
        params: filters,
        headers: createAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching payrolls:', error)
      throw error.response?.data || error.message
    }
  }

  async deletePayrolls(payrollIds: string[]): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/payroll/bulk-delete`, {
        data: { payrollIds },
        headers: createAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      console.error('Error deleting payrolls:', error)
      throw error.response?.data || error.message
    }
  }

  async resetPayrollStatus(payrollIds: string[]): Promise<{
    success: boolean;
    message: string;
    modifiedCount: number;
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payroll/reset-status`, {
        payrollIds
      }, {
        headers: createAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      console.error('Error resetting payroll status:', error)
      throw error.response?.data || error.message
    }
  }

  // Utility functions
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'not_generated': 'bg-gray-100 text-gray-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'paid': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || colors['not_generated']
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'not_generated': 'Not Generated',
      'draft': 'Draft',
      'approved': 'Approved',
      'paid': 'Paid',
      'rejected': 'Rejected'
    }
    return texts[status] || status.replace('_', ' ').toUpperCase()
  }
}

export const newPayrollService = new NewPayrollService()
export default newPayrollService
