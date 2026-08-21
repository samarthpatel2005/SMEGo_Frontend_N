'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { employeeService, Employee, GetEmployeesParams } from '@/services/employeeService'
import { getCurrentOrganization } from '@/services/organizationService'
// import { useAuth } from '@/hooks/useAuth'

interface InviteFormData {
  email: string
  role: 'employee' | 'manager' | 'hr' | 'accountant'
  department: string
  position: string
}

interface EmployeeFilters {
  search: string
  department: string
  role: string
  page: number
  limit: number
}

const EmployeeDashboard = () => {
  // const { user } = useAuth()
  const user = { role: 'admin' } // Temporary mock user
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [organizationCode, setOrganizationCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  
  // Debug logging for modal state
  useEffect(() => {
    console.log('showInviteModal state changed:', showInviteModal)
  }, [showInviteModal])
  
  const [sendingInvite, setSendingInvite] = useState(false)
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: '',
    role: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  useEffect(() => {
    fetchEmployees()
  }, [filters])

  // Fetch organization code when invite modal opens
  useEffect(() => {
    if (showInviteModal && !organizationCode) {
      fetchOrganizationCode()
    }
  }, [showInviteModal])

  const fetchOrganizationCode = async () => {
    setLoadingCode(true)
    try {
      // Use the organization service to get current organization
      const organization = await getCurrentOrganization()
      
      if (organization?.joinCode) {
        setOrganizationCode(organization.joinCode)
      } else {
        console.warn('No joinCode found in organization data')
        setOrganizationCode('NO-CODE-SET')
      }
    } catch (error) {
      console.error('Error fetching organization code:', error)
      // Fallback to a mock code for development
      setOrganizationCode('ORG123ABC')
    } finally {
      setLoadingCode(false)
    }
  }

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const params: GetEmployeesParams = {
        page: filters.page,
        limit: filters.limit
      }
      
      if (filters.search) params.search = filters.search
      if (filters.department) params.department = filters.department
      if (filters.role) params.role = filters.role

      const result = await employeeService.getEmployees(params)
      setEmployees(result.data.employees || [])
      setPagination(result.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof EmployeeFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetailsModal(true)
  }

  // Check if user has permission to manage employees
  const canManageEmployees = user?.role === 'owner' || user?.role === 'admin'

  // Employee stats
  const employeeStats = {
    total: pagination.total,
    active: employees.filter(emp => emp.isActive).length,
    inactive: employees.filter(emp => !emp.isActive).length,
    departments: [...new Set(employees.map(emp => emp.department).filter(Boolean))].length
  }

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      owner: 'bg-amber-100 text-amber-800',
      manager: 'bg-blue-100 text-blue-800',
      hr: 'bg-green-100 text-green-800',
      accountant: 'bg-indigo-100 text-indigo-800',
      employee: 'bg-gray-100 text-gray-800'
    }
    return colors[role as keyof typeof colors] || colors.employee
  }

  const renderEmployeeCard = (employee: Employee) => (
    <div key={employee._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{employee.fullName}</h3>
            <p className="text-slate-500 text-sm">{employee.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            employee.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {employee.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Role:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getRoleColor(employee.role)}`}>
            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
          </span>
        </div>
        {employee.department && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Department:</span>
            <span className="text-sm font-medium text-slate-900">{employee.department}</span>
          </div>
        )}
        {employee.position && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Position:</span>
            <span className="text-sm font-medium text-slate-900">{employee.position}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Joined via:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            employee.joinedVia === 'invite' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {employee.joinedVia === 'invite' ? 'Invite' : 'Code'}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleViewEmployee(employee)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          View Details
        </button>
        {canManageEmployees && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Manage
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Employee Management</h1>
            <p className="text-slate-600">Manage your team members and organizational structure</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            <Button 
              onClick={() => {
                console.log('Button clicked, setting modal to true')
                setShowInviteModal(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{employeeStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Members</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{employeeStats.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Inactive Members</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{employeeStats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{employeeStats.departments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {inviteSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-emerald-800 font-medium">Success!</p>
              <p className="text-emerald-700 text-sm mt-1">{inviteSuccess}</p>
            </div>
            <button
              onClick={() => setInviteSuccess('')}
              className="text-emerald-500 hover:text-emerald-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Employees</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-12 h-12 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Departments</option>
                <option value="IT">Information Technology</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance & Accounting</option>
                <option value="Sales">Sales & Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Support">Customer Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Specialist</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 shadow-lg">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No employees found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">Start building your team by inviting employees to join your organization.</p>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Your First Employee
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map(renderEmployeeCard)}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role & Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined Via</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {employees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">{employee.fullName}</div>
                            <div className="text-sm text-slate-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${getRoleColor(employee.role)} mb-1`}>
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </div>
                        {employee.department && (
                          <div className="text-sm text-slate-600">{employee.department}</div>
                        )}
                        {employee.position && (
                          <div className="text-xs text-slate-500">{employee.position}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${
                          employee.joinedVia === 'invite' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {employee.joinedVia === 'invite' ? 'Invitation' : 'Organization Code'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg ${
                          employee.isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200"
                        >
                          View
                        </button>
                        {canManageEmployees && (
                          <button className="text-emerald-600 hover:text-emerald-900 font-medium transition-colors duration-200">
                            {employee.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, pagination.current - 1))}
                      disabled={pagination.current === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(pagination.pages, pagination.current + 1))}
                      disabled={pagination.current === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing{' '}
                        <span className="font-semibold">{(pagination.current - 1) * filters.limit + 1}</span>
                        {' '}to{' '}
                        <span className="font-semibold">
                          {Math.min(pagination.current * filters.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-semibold">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(Math.max(1, pagination.current - 1))}
                          disabled={pagination.current === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let page;
                          if (pagination.pages <= 5) {
                            page = i + 1;
                          } else if (pagination.current <= 3) {
                            page = i + 1;
                          } else if (pagination.current >= pagination.pages - 2) {
                            page = pagination.pages - 4 + i;
                          } else {
                            page = pagination.current - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.current
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(Math.min(pagination.pages, pagination.current + 1))}
                          disabled={pagination.current === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employee Details Modal */}
        {showDetailsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Employee Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Employee Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedEmployee.fullName}</h3>
                      <p className="text-slate-600 mb-3">{selectedEmployee.email}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${getRoleColor(selectedEmployee.role)}`}>
                          {selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1)}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                          selectedEmployee.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h4>
                    
                    {selectedEmployee.department && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                        <p className="text-slate-900 font-medium">{selectedEmployee.department}</p>
                      </div>
                    )}
                    
                    {selectedEmployee.position && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Position</label>
                        <p className="text-slate-900 font-medium">{selectedEmployee.position}</p>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                      <p className="text-slate-900 font-medium capitalize">{selectedEmployee.role}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h4>
                    
                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Joined Via</label>
                      <p className="text-slate-900 font-medium">
                        {selectedEmployee.joinedVia === 'invite' ? 'Email Invitation' : 'Organization Code'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Employee ID</label>
                      <p className="text-slate-900 font-medium font-mono text-sm">{selectedEmployee._id}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Account Status</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedEmployee.isActive ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></div>
                        <p className="text-slate-900 font-medium">
                          {selectedEmployee.isActive ? 'Active Account' : 'Inactive Account'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {canManageEmployees && (
                  <div className="mt-8 flex gap-3 pt-6 border-t border-slate-200">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
                      Edit Employee
                    </Button>
                    <Button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl">
                      {selectedEmployee.isActive ? 'Deactivate' : 'Activate'} Account
                    </Button>
                    <Button className="px-6 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl border border-red-200">
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invite Employee Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Invite Employee</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">Organization Join Code</h3>
                <p className="text-slate-600 mb-6">Share this code with employees to join your organization</p>
                
                {loadingCode ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Loading organization code...</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2l-4.586-4.586A6 6 0 0112 1.257M15 7a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4z" />
                      </svg>
                      <p className="text-blue-800 font-semibold">Join Code</p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                      <code className="text-2xl font-bold text-slate-900 tracking-wider select-all">
                        {organizationCode || 'Loading...'}
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(organizationCode)
                        // Optional: Show a success message
                      }}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </button>
                  </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-amber-800 font-semibold text-sm mb-1">How to use:</p>
                      <p className="text-amber-700 text-sm">
                        Share this code with employees. They can use it during registration to join your organization.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
          );
        };
        
        export default EmployeeDashboard;