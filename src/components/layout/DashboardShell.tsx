'use client'

import Sidebar from './Sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DashboardShellProps {
  children: React.ReactNode
}

const ROUTE_MODULE_MAP: Record<string, string> = {
  '/dashboard/analytics': 'analytics',
  '/dashboard/invoices': 'invoices',
  '/dashboard/Client': 'clients',
  '/dashboard/products': 'products',
  '/dashboard/transactions': 'transactions',
  '/dashboard/complaints': 'complaints',
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [initials, setInitials] = useState('')
  const [hasAccess, setHasAccess] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user')
      if (saved) {
        const u = JSON.parse(saved)
        const name: string = u.fullName || u.name || ''
        const init = name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((s: string) => s[0]?.toUpperCase())
          .join('')
        setInitials(init || 'U')

        // Route Protection for Employees
        const isAdmin = u.role?.toLowerCase() === 'admin' || u.userType?.toLowerCase() === 'admin'
        if (!isAdmin && u.userType === 'employee') {
          // Find matching module key
          const matchedRoute = Object.keys(ROUTE_MODULE_MAP).find(route => 
            pathname === route || pathname?.startsWith(route + '/')
          )

          if (matchedRoute) {
            const requiredModule = ROUTE_MODULE_MAP[matchedRoute]
            const userPermissions: string[] = u.modulePermissions || ['dashboard']
            
            if (!userPermissions.includes(requiredModule)) {
              setHasAccess(false)
              return
            }
          }
        }
        setHasAccess(true)
      }
    } catch {
      setHasAccess(true)
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/profile" className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {initials || 'U'}
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {hasAccess ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center p-8 bg-white rounded-2xl border-2 border-gray-100 shadow-xl">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border-2 border-rose-100">
                <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-500 mb-6">
                You do not have permission to access this module. Please contact your organization administrator if you believe this is an error.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardShell
