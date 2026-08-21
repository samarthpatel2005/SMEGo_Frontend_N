import LoginForm from '@/components/forms/LoginForm'
import { jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeRequired(): R
      toBeChecked(): R
      toHaveAttribute(attr: string, value?: string): R
    }
  }
}

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('LoginForm', () => {
  beforeEach(() => {
    mockLocation.href = ''
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error for empty fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toBeRequired()
  })

  it('handles form submission with valid credentials', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText(/signing in.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(mockLocation.href).toBe('/dashboard')
    }, { timeout: 2000 })
  })

  it('shows error message for invalid credentials', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'Invalid credentials' }),
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)
    ) as jest.MockedFunction<typeof fetch>

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('has remember me checkbox', () => {
    render(<LoginForm />)
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    expect(rememberCheckbox).toBeInTheDocument()
    expect(rememberCheckbox).not.toBeChecked()
  })

  it('has forgot password link', () => {
    render(<LoginForm />)
    
    const forgotLink = screen.getByText(/forgot your password/i)
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '#')
  })

  it('has sign up link', () => {
    render(<LoginForm />)
    
    const signUpLink = screen.getByText(/sign up/i)
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/auth/register')
  })
})
