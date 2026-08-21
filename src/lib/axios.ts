import axios from 'axios'

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios request - Token exists:', !!token, 'URL:', config.url)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add retry count to track attempts (using any to avoid TypeScript issues)
    ;(config as any)._retryCount = (config as any)._retryCount || 0
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and retries
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const config = error.config
    
    // Better error logging with more details
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: config?.url,
      method: config?.method?.toUpperCase(),
      retryCount: (config as any)?._retryCount,
      responseData: error.response?.data,
      isNetworkError: !error.response,
      timestamp: new Date().toISOString()
    }
    
    console.error('API Error Details:', errorDetails)
    
    // Also log the raw error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Raw error object:', error)
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }
    
    // Handle timeout errors with retry logic
    const isTimeout = error.code === 'ECONNABORTED' && error.message.includes('timeout')
    const isNetworkError = error.message === 'Network Error'
    const retryCount = (config as any)?._retryCount || 0
    const shouldRetry = (isTimeout || isNetworkError) && retryCount < 2
    
    if (shouldRetry && config) {
      ;(config as any)._retryCount = retryCount + 1
      console.log(`Retrying request (attempt ${retryCount + 2}/3):`, config.url)
      
      // Add exponential backoff delay
      const delay = Math.pow(2, retryCount + 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return axiosInstance(config)
    }
    
    if (isTimeout) {
      console.error('Request timeout after retries - consider optimizing backend queries')
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
