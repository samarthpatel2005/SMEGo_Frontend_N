'use client'

import DashboardShell from '@/components/layout/DashboardShell'
import { employeeService, Employee } from '@/services/employeeService'
import { useEffect, useState } from 'react'

// All available modules with metadata
const ALL_MODULES = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Overview & stats',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    color: 'blue',
    alwaysOn: true,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Reports & insights',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'purple',
    alwaysOn: false,
  },
  {
    key: 'invoices',
    label: 'Invoices',
    description: 'Billing & payments',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'green',
    alwaysOn: false,
  },
  {
    key: 'clients',
    label: 'Clients',
    description: 'Customer management',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.004 3.004 0 005.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'cyan',
    alwaysOn: false,
  },
  {
    key: 'products',
    label: 'Products',
    description: 'Inventory & catalog',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'orange',
    alwaysOn: false,
  },
  {
    key: 'transactions',
    label: 'Transactions',
    description: 'Financial records',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    color: 'indigo',
    alwaysOn: false,
  },
  {
    key: 'complaints',
    label: 'Complaints',
    description: 'Support & feedback',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'rose',
    alwaysOn: false,
  },
]

const MODULE_COLORS: Record<string, { bg: string; border: string; text: string; check: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', check: 'accent-blue-600', icon: 'text-blue-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', check: 'accent-purple-600', icon: 'text-purple-500' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', check: 'accent-green-600', icon: 'text-green-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', check: 'accent-cyan-600', icon: 'text-cyan-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', check: 'accent-orange-600', icon: 'text-orange-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', check: 'accent-indigo-600', icon: 'text-indigo-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', check: 'accent-rose-600', icon: 'text-rose-500' },
}

const ROLE_PRESETS: Record<string, string[]> = {
  'Product Manager': ['dashboard', 'products', 'analytics'],
  'Accountant': ['dashboard', 'invoices', 'transactions', 'analytics'],
  'Sales': ['dashboard', 'clients', 'invoices', 'products'],
  'Support': ['dashboard', 'complaints', 'clients'],
  'Full Access': ['dashboard', 'analytics', 'invoices', 'clients', 'products', 'transactions', 'complaints'],
}

const getRoleInitials = (name: string) => {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-gray-100 text-gray-700',
    hr: 'bg-purple-100 text-purple-700',
    accountant: 'bg-green-100 text-green-700',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

const getAvatarColor = (name: string) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-indigo-500 to-indigo-600',
    'from-rose-500 to-rose-600',
    'from-teal-500 to-teal-600',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function AccessControlPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await employeeService.getEmployees({ limit: 100 })
      const emps = res.data.employees
      setEmployees(emps)

      // Initialize local permissions from employee data
      const perms: Record<string, string[]> = {}
      emps.forEach(emp => {
        perms[emp._id] = emp.modulePermissions?.length ? emp.modulePermissions : ['dashboard']
      })
      setPermissions(perms)
    } catch (e: any) {
      setError('Failed to load employees. Please make sure you are logged in as admin.')
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (employeeId: string, moduleKey: string) => {
    setPermissions(prev => {
      const current = prev[employeeId] || ['dashboard']
      if (moduleKey === 'dashboard') return prev // Can't toggle dashboard
      if (current.includes(moduleKey)) {
        return { ...prev, [employeeId]: current.filter(m => m !== moduleKey) }
      } else {
        return { ...prev, [employeeId]: [...current, moduleKey] }
      }
    })
  }

  const applyPreset = (employeeId: string, presetName: string) => {
    const preset = ROLE_PRESETS[presetName]
    if (preset) {
      setPermissions(prev => ({ ...prev, [employeeId]: preset }))
    }
  }

  const savePermissions = async (employeeId: string) => {
    setSaving(employeeId)
    setError('')
    try {
      const mods = permissions[employeeId] || ['dashboard']
      await employeeService.updatePermissions(employeeId, mods)
      setSaved(employeeId)
      setTimeout(() => setSaved(null), 2500)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save permissions')
    } finally {
      setSaving(null)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPermissionCount = (employeeId: string) => {
    return (permissions[employeeId] || ['dashboard']).length
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Access Control</h1>
                <p className="text-slate-300 mt-0.5 text-sm">Control which modules each employee can access in the dashboard</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-3xl font-bold">{employees.length}</div>
              <div className="text-slate-400 text-sm">Total Employees</div>
            </div>
          </div>

          {/* Quick legend */}
          <div className="mt-5 flex flex-wrap gap-3">
            {Object.entries(ROLE_PRESETS).map(([name, modules]) => (
              <div key={name} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="font-medium">{name}</span>
                <span className="text-slate-400">({modules.length} modules)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search employees by name, email, role, or department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Loading employees...</h3>
            <p className="text-gray-500 text-sm">Fetching your organization's employee list</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No employees found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try a different search term' : 'Invite employees to your organization first'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map(employee => {
              const isExpanded = expandedEmployee === employee._id
              const empPermissions = permissions[employee._id] || ['dashboard']
              const permCount = getPermissionCount(employee._id)
              const isSaving = saving === employee._id
              const isSaved = saved === employee._id

              return (
                <div
                  key={employee._id}
                  className={`bg-white rounded-xl border-2 shadow-sm transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'border-blue-300 shadow-blue-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Employee Row */}
                  <button
                    onClick={() => setExpandedEmployee(isExpanded ? null : employee._id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(employee.fullName)} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
                        {getRoleInitials(employee.fullName)}
                      </div>
                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-base">{employee.fullName}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                            {employee.role}
                          </span>
                          {!employee.isEmailVerified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                        {employee.department && (
                          <p className="text-xs text-gray-400">{employee.department}</p>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                      {/* Module count badges */}
                      <div className="hidden sm:flex flex-wrap gap-1 max-w-xs justify-end">
                        {ALL_MODULES.filter(m => empPermissions.includes(m.key)).map(m => {
                          const colors = MODULE_COLORS[m.color]
                          return (
                            <span key={m.key} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {m.label}
                            </span>
                          )
                        })}
                      </div>
                      <div className="sm:hidden text-sm text-gray-600 font-medium">
                        {permCount} module{permCount !== 1 ? 's' : ''}
                      </div>
                      {/* Chevron */}
                      <div className={`p-1 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Permissions Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-5">
                      {/* Role Presets */}
                      <div className="mb-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Quick Presets
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(ROLE_PRESETS).map(presetName => (
                            <button
                              key={presetName}
                              onClick={() => applyPreset(employee._id, presetName)}
                              className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150"
                            >
                              {presetName}
                            </button>
                          ))}
                          <button
                            onClick={() => setPermissions(prev => ({ ...prev, [employee._id]: ['dashboard'] }))}
                            className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-red-200 text-red-600 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-150"
                          >
                            Reset to Minimum
                          </button>
                        </div>
                      </div>

                      {/* Module Checkboxes */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Module Access
                          <span className="text-xs font-normal text-gray-400">({empPermissions.length} of {ALL_MODULES.length} enabled)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {ALL_MODULES.map(mod => {
                            const isEnabled = empPermissions.includes(mod.key)
                            const colors = MODULE_COLORS[mod.color]
                            return (
                              <label
                                key={mod.key}
                                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                                  mod.alwaysOn
                                    ? `${colors.bg} ${colors.border} opacity-75 cursor-not-allowed`
                                    : isEnabled
                                    ? `${colors.bg} ${colors.border} shadow-sm`
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  disabled={mod.alwaysOn}
                                  onChange={() => toggleModule(employee._id, mod.key)}
                                  className={`mt-0.5 w-4 h-4 rounded ${colors.check} flex-shrink-0`}
                                />
                                <div className="min-w-0">
                                  <div className={`flex items-center gap-1.5 mb-0.5 ${isEnabled ? colors.text : 'text-gray-600'}`}>
                                    <span className={`${isEnabled ? colors.icon : 'text-gray-400'}`}>
                                      {mod.icon}
                                    </span>
                                    <span className="text-sm font-semibold">{mod.label}</span>
                                    {mod.alwaysOn && (
                                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">Always On</span>
                                    )}
                                  </div>
                                  <p className={`text-xs ${isEnabled ? colors.text : 'text-gray-400'}`}>{mod.description}</p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">
                          Changes will take effect on the employee's next page load
                        </p>
                        <button
                          onClick={() => savePermissions(employee._id)}
                          disabled={isSaving}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                            isSaved
                              ? 'bg-green-600 text-white cursor-default'
                              : isSaving
                              ? 'bg-blue-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:-translate-y-0.5'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Saved!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              Save Permissions
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
