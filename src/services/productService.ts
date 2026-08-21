import axiosInstance from '@/lib/axios'

export interface Product {
  minStock: number
  _id: string
  name: string
  sku: string
  description?: string
  category?: string
  stock: number
  reservedStock: number
  availableStock: number
  costPrice: number
  sellingPrice: number
  trackInventory: boolean
  reorderPoint?: number
  isActive: boolean
  isLowStock: boolean
  organization: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  sku?: string
  description?: string
  category?: string
  stock?: number
  costPrice: number
  sellingPrice: number
  trackInventory?: boolean
  reorderPoint?: number
  isActive?: boolean
}

export interface ProductListResponse {
  success: boolean
  data: Product[]
  pagination: {
    current: number
    pages: number
    total: number
  }
}

export interface InventoryValuation {
  totalProducts: number
  totalStockValue: number
  totalCostValue: number
  potentialProfit: number
  categories: Array<{
    category: string
    products: number
    stockValue: number
    costValue: number
  }>
}

export interface StockAdjustment {
  quantity: number
  reason: string
  type: 'increase' | 'decrease'
}

class ProductService {
  private checkAuth(): void {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('ProductService: No authentication token found')
      throw new Error('Authentication required. Please log in.')
    }
  }

  async list(params?: {
    search?: string
    category?: string
    trackInventory?: boolean
    lowStock?: boolean
    page?: number
    limit?: number
  }): Promise<ProductListResponse> {
    try {
      this.checkAuth()
      console.log('ProductService: Fetching products with params:', params)
      const response = await axiosInstance.get('/products', { params })
      console.log('ProductService: Products fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('ProductService: Failed to fetch products:', error)
      console.error('ProductService: Error response:', error.response?.data)
      console.error('ProductService: Error status:', error.response?.status)
      throw error
    }
  }

  async create(data: CreateProductData): Promise<{ success: boolean; data: Product; message: string }> {
    const response = await axiosInstance.post('/products', data)
    return response.data
  }

  async update(id: string, data: Partial<CreateProductData>): Promise<{ success: boolean; data: Product; message: string }> {
    const response = await axiosInstance.put(`/products/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/products/${id}`)
    return response.data
  }

  async getById(id: string): Promise<{ success: boolean; data: Product }> {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
  }

  async adjustStock(id: string, adjustment: StockAdjustment): Promise<{ success: boolean; data: Product; message: string }> {
    const response = await axiosInstance.post(`/products/${id}/adjust-stock`, adjustment)
    return response.data
  }

  async getLowStockProducts(): Promise<{ success: boolean; data: Product[]; count: number }> {
    try {
      this.checkAuth()
      console.log('ProductService: Fetching low stock products')
      const response = await axiosInstance.get('/products/low-stock')
      console.log('ProductService: Low stock products fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('ProductService: Failed to fetch low stock products:', error)
      console.error('ProductService: Error response:', error.response?.data)
      console.error('ProductService: Error status:', error.response?.status)
      throw error
    }
  }

  async getInventoryValuation(): Promise<{ success: boolean; data: InventoryValuation }> {
    try {
      this.checkAuth()
      console.log('ProductService: Fetching inventory valuation')
      const response = await axiosInstance.get('/products/valuation')
      console.log('ProductService: Inventory valuation fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('ProductService: Failed to fetch inventory valuation:', error)
      console.error('ProductService: Error response:', error.response?.data)
      console.error('ProductService: Error status:', error.response?.status)
      throw error
    }
  }

  async getCategories(): Promise<{ success: boolean; data: string[] }> {
    try {
      this.checkAuth()
      console.log('ProductService: Fetching categories')
      const response = await axiosInstance.get('/products/categories')
      console.log('ProductService: Categories fetch successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('ProductService: Failed to fetch categories:', error)
      console.error('ProductService: Error response:', error.response?.data)
      console.error('ProductService: Error status:', error.response?.status)
      throw error
    }
  }
}

export const productService = new ProductService()
