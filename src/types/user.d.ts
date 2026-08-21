// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: 'super_admin' | 'admin' | 'manager' | 'employee'
  organizationId: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: string
  organizationId: string
  password?: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
}
