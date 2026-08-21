import { useState, useEffect } from 'react'
import { employeeService, Employee, GetEmployeesParams } from '@/services/employeeService'

interface UseEmployeesOptions {
  autoFetch?: boolean
  initialParams?: GetEmployeesParams
}

interface UseEmployeesReturn {
  employees: Employee[]
  loading: boolean
  error: string | null
  pagination: {
    current: number
    pages: number
    total: number
  }
  fetchEmployees: (params?: GetEmployeesParams) => Promise<void>
  refreshEmployees: () => Promise<void>
}

export const useEmployees = (options: UseEmployeesOptions = {}): UseEmployeesReturn => {
  const { autoFetch = true, initialParams = {} } = options
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })
  const [currentParams, setCurrentParams] = useState<GetEmployeesParams>(initialParams)

  const fetchEmployees = async (params: GetEmployeesParams = currentParams) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentParams(params)
      
      const response = await employeeService.getEmployees(params)
      setEmployees(response.data.employees)
      setPagination(response.data.pagination)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch employees'
      setError(errorMessage)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }
  const refreshEmployees = async () => {
    await fetchEmployees(currentParams)
  }

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchEmployees(initialParams)
    }
  }, []) // Only run on mount

  return {
    employees,
    loading,
    error,
    pagination,
    fetchEmployees,
    refreshEmployees
  }
}

export default useEmployees
