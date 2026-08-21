'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentProfile } from '@/services/profileService'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userType, setUserType] = useState('')
  const [initials, setInitials] = useState('U')
  const [modulePermissions, setModulePermissions] = useState<string[] | null>(null)

  useEffect(() => {
    // 1. Initial load from local storage cache to prevent flash
    try {
      const saved = localStorage.getItem('user')
      if (saved) {
        const u = JSON.parse(saved)
        const name: string = u.fullName || u.name || ''
        setUserName(name)
        setUserRole(u.role || '')
        setUserType(u.userType || '')
        const init = name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((s: string) => s[0]?.toUpperCase())
          .join('')
        setInitials(init || 'U')

        if (u.userType === 'employee') {
          setModulePermissions(u.modulePermissions || ['dashboard'])
        } else {
          setModulePermissions(null)
        }
      }
    } catch {}

    // 2. Fetch fresh profile details from API to dynamically sync changed permissions
    const fetchFreshProfile = async () => {
      try {
        const profile = await getCurrentProfile()
        if (profile) {
          setUserName(profile.fullName)
          setUserRole(profile.role)
          setUserType(profile.userType)
          
          if (profile.userType === 'employee') {
            const perms = profile.modulePermissions || ['dashboard']
            setModulePermissions(perms)

            // Update local storage user cache
            const saved = localStorage.getItem('user')
            if (saved) {
              const u = JSON.parse(saved)
              u.fullName = profile.fullName
              u.role = profile.role
              u.modulePermissions = perms
              localStorage.setItem('user', JSON.stringify(u))
            }
          } else {
            setModulePermissions(null)
          }
        }
      } catch (err) {
        console.error('Sidebar profile sync error:', err)
      }
    }

    fetchFreshProfile()
  }, [])

  // Check if user is admin (by role or userType)
  const isAdmin = userRole?.toLowerCase() === 'admin' || userType?.toLowerCase() === 'admin'

  // Check if employee has access to a specific module
  const hasModuleAccess = (moduleKey: string) => {
    if (isAdmin) return true // Admins always have full access
    if (modulePermissions === null) return true // Not loaded yet or admin
    return modulePermissions.includes(moduleKey)
  }

  // Navigation items with module keys for permission check
  const navigation = [
    // Core features
    {
      name: 'Dashboard',
      href: '/dashboard',
      moduleKey: 'dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      moduleKey: 'analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Invoices',
      href: '/dashboard/invoices',
      moduleKey: 'invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Clients',
      href: '/dashboard/Client',
      moduleKey: 'clients',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.004 3.004 0 005.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      moduleKey: 'products',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      moduleKey: 'transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      adminOnly: false
    },
    {
      name: 'Complaints',
      href: '/dashboard/complaints',
      moduleKey: 'complaints',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      adminOnly: false
    },

    // Admin-only features
    {
      name: 'Employees',
      href: '/dashboard/employees',
      moduleKey: null, // Admin always sees this
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Access Control',
      href: '/dashboard/admin/access-control',
      moduleKey: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Attendance',
      href: '/dashboard/attendance',
      moduleKey: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Payroll',
      href: '/dashboard/payroll',
      moduleKey: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Subscription',
      href: '/dashboard/subscription',
      moduleKey: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      adminOnly: true
    },

    // User settings - always visible
    {
      name: 'Profile',
      href: '/dashboard/profile',
      moduleKey: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      adminOnly: false
    },
  ]

  // Filter navigation based on:
  // 1. adminOnly flag (hide admin items from employees)
  // 2. modulePermissions (hide modules employee doesn't have access to)
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.moduleKey && !hasModuleAccess(item.moduleKey)) return false
    return true
  })

  // Group navigation items
  const coreItems = filteredNavigation.filter(item =>
    ['Dashboard', 'Analytics', 'Invoices', 'Clients', 'Products', 'Transactions', 'Complaints'].includes(item.name)
  )
  const managementItems = filteredNavigation.filter(item =>
    ['Employees', 'Access Control', 'Attendance', 'Payroll', 'Subscription'].includes(item.name)
  )
  const settingsItems = filteredNavigation.filter(item =>
    ['Profile', 'Settings'].includes(item.name)
  )

  const renderNavSection = (items: typeof navigation, title?: string) => (
    <div className="space-y-1">
      {title && !isCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 truncate">{item.name}</span>
            )}
            {!isCollapsed && isActive && (
              <span className="ml-auto">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className={`bg-slate-900 text-white ${isCollapsed ? 'w-16' : 'w-72'} transition-all duration-300 flex flex-col shadow-2xl border-r border-slate-800`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="SMEGo Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SMEGo</h2>
              <p className="text-xs text-slate-400">Business Operations</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={`w-4 h-4 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {/* Core Features */}
        {coreItems.length > 0 && renderNavSection(coreItems, 'Core')}

        {/* Management Features (Admin Only) */}
        {managementItems.length > 0 && renderNavSection(managementItems, 'Management')}

        {/* Settings */}
        {settingsItems.length > 0 && renderNavSection(settingsItems, 'Account')}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-800/50">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-xl transition-colors duration-200 group"
          title={isCollapsed ? `${userName || 'User Profile'}` : undefined}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">
                {userRole ? (
                  <span className={`inline-flex items-center gap-1 ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isAdmin && <span>👑</span>}
                    {userRole}
                  </span>
                ) : 'Member'}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>
      </div>
    </div>
  )
}

export default Sidebar