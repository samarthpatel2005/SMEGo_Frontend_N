"use client"
import DashboardShell from '@/components/layout/DashboardShell'
import { clientService } from '@/services/clientService'
import { invoiceService } from '@/services/invoiceService'
import { productService } from '@/services/productService'
import { Client } from '@/types/client'
import { useEffect, useRef, useState } from 'react'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')

  // Client dropdown state
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  // Ref for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Create form state (minimal viable)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    currency: 'INR',
    selectedProduct: '',
    paymentOption: 'pay_later' // 'pay_now' or 'pay_later'
  })

  useEffect(() => {
    (async () => {
      try {
        const [invoicesRes, productsRes, clientsRes] = await Promise.all([
          invoiceService.list(),
          productService.list(),
          clientService.getClients({ page: 1, limit: 100 }) // Fetch all active clients
        ])
        setInvoices(invoicesRes.data || [])
        setProducts(productsRes.data || [])
        setClients(clientsRes.data || [])
      } catch (e) {
        console.error(e)
        const msg = (e as any)?.response?.data?.message || 'Failed to load data'
        setError(msg)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.client?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime()
        case 'amount_desc':
          return b.totalAmount - a.totalAmount
        case 'due_date':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        default:
          return 0
      }
    })

  // Statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  }

  function handleProductSelect(productId: string) {
    const product = products.find(p => p._id === productId)
    if (product) {
      setForm({
        ...form,
        selectedProduct: productId,
        description: product.name,
        unitPrice: product.price
      })
    }
  }

  function handleClientSelect(client: Client) {
    setSelectedClient(client)
    setForm({
      ...form,
      clientName: client.name,
      clientEmail: client.email
    })
    setClientSearchQuery(client.name)
    setShowClientDropdown(false)
  }

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    (client.companyName && client.companyName.toLowerCase().includes(clientSearchQuery.toLowerCase()))
  )

  async function createInvoice() {
    try {
      setError('')
      
      // Prepare invoice items with product ID if selected
      const invoiceItems = [{
        description: form.description,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        taxRate: Number(form.taxRate),
        ...(form.selectedProduct && { productId: form.selectedProduct })
      }]
      
      const payload = {
        client: { name: form.clientName, email: form.clientEmail },
        items: invoiceItems,
        currency: form.currency,
        dueDate: form.dueDate
      }
      
      console.log('🚀 Creating invoice with payload:', payload)
      const res = await invoiceService.create(payload as any)
      
      // Handle payment option
      if (form.paymentOption === 'pay_now') {
        try {
          // Create Razorpay checkout and redirect
          const checkoutRes = await invoiceService.createCheckout(res.data._id)
          window.location.href = checkoutRes.data.url
          return // Don't close modal or refresh list yet since user is being redirected
        } catch (paymentError) {
          console.error('Payment link creation failed:', paymentError)
          setError('Invoice created but failed to create payment link. You can create it later from the invoice list.')
        }
      }
      
      // Refresh list
      const list = await invoiceService.list()
      setInvoices(list.data || [])
      setShowCreate(false)
      
      // Reset form
      setForm({
        clientName: '',
        clientEmail: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        currency: 'INR',
        selectedProduct: '',
        paymentOption: 'pay_later'
      })
      // Reset client selection
      setSelectedClient(null)
      setClientSearchQuery('')
      setShowClientDropdown(false)
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || 'Failed to create invoice'
      setError(msg)
    }
  }

  async function deleteInvoice(invoiceId: string, invoiceNumber: string) {
    const confirmed = window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)
    if (!confirmed) return

    try {
      setError('')
      console.log(`🗑️ [FRONTEND] Deleting invoice: ${invoiceNumber} (ID: ${invoiceId})`)
      
      const deleteResponse = await invoiceService.delete(invoiceId)
      console.log(`✅ [FRONTEND] Delete response:`, deleteResponse)
      
      // Refresh list after deletion
      console.log(`🔄 [FRONTEND] Refreshing invoice list...`)
      const list = await invoiceService.list()
      setInvoices(list.data || [])
      console.log(`✅ [FRONTEND] Invoice list refreshed. Count: ${list.data?.length || 0}`)
      
    } catch (e) {
      console.error(`❌ [FRONTEND] Delete error:`, e)
      const msg = (e as any)?.response?.data?.message || 'Failed to delete invoice'
      setError(msg)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200'
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return '✓'
      case 'sent': return '📧'
      case 'overdue': return '⚠️'
      case 'draft': return '📝'
      default: return '📄'
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 -mx-8 -mt-8 px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Invoice Management</h1>
                <p className="text-blue-100 mt-1">Streamline your billing process and track payments</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Paid Invoices</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                <p className="text-xs text-gray-500">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(stats.paidAmount)}
                </p>
              </div>
            </div>
          </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              </div>
              <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Draft Invoices</h3>
              <p className="text-2xl font-bold text-gray-900">{invoices.filter(inv => inv.status === 'draft').length}</p>
              </div>
            </div>
            </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search invoices, clients, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_desc">Newest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="due_date">Due Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-lg mt-4">Loading invoices...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Get started by creating your first invoice"}
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <button 
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Invoice
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(inv.createdAt || inv._id).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inv.client?.name}</div>
                          <div className="text-sm text-gray-500">{inv.client?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency || 'USD' }).format(inv.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                            <span className="mr-1.5">{getStatusIcon(inv.status)}</span>
                            {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(inv.dueDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button 
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" 
                            onClick={async () => {
                              try {
                                await invoiceService.downloadPdf(inv._id)
                              } catch (e) {
                                alert('Failed to download PDF')
                              }
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                          </button>
                          
                          <button 
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" 
                            onClick={async () => { 
                              try {
                                await invoiceService.sendInvoice(inv._id); 
                                alert('Invoice sent successfully!');
                                const list = await invoiceService.list();
                                setInvoices(list.data || []);
                              } catch (e) {
                                alert('Failed to send invoice');
                              }
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send
                          </button>

                          {inv.status !== 'paid' ? (
                            <button 
                              className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors" 
                              onClick={async () => { 
                                try {
                                  const r = await invoiceService.createCheckout(inv._id); 
                                  window.location.href = r.data.url;
                                } catch (e) {
                                  alert('Failed to create payment link');
                                }
                              }}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pay
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-100">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Paid
                            </span>
                          )}

                          <button 
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors" 
                            onClick={() => deleteInvoice(inv._id, inv.invoiceNumber)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Create New Invoice</h3>
                    <p className="mt-1 text-sm text-gray-600">Generate a professional invoice for your client</p>
                  </div>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setShowCreate(false)}
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-8 py-6 space-y-8">
                {/* Client Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Selection Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Client <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" 
                          placeholder="Search or type client name..."
                          value={clientSearchQuery}
                          onChange={(e) => {
                            setClientSearchQuery(e.target.value)
                            setShowClientDropdown(true)
                            if (!e.target.value) {
                              setSelectedClient(null)
                              setForm({...form, clientName: '', clientEmail: ''})
                            }
                          }}
                          onFocus={() => setShowClientDropdown(true)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        
                        {/* Dropdown */}
                        {showClientDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredClients.length > 0 ? (
                              filteredClients.map((client) => (
                                <div
                                  key={client._id}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleClientSelect(client)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">{client.name}</div>
                                      <div className="text-sm text-gray-500">{client.email}</div>
                                      {client.companyName && (
                                        <div className="text-xs text-gray-400">{client.companyName}</div>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        client.status === 'active' ? 'bg-green-100 text-green-700' : 
                                        client.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {client.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-center">
                                {clientSearchQuery ? 'No clients found' : 'Start typing to search clients'}
                              </div>
                            )}
                            
                            {/* Add new client option */}
                            {clientSearchQuery && !filteredClients.some(client => 
                              client.name.toLowerCase() === clientSearchQuery.toLowerCase()
                            ) && (
                              <div className="border-t border-gray-200">
                                <div
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-blue-600"
                                  onClick={() => {
                                    setForm({...form, clientName: clientSearchQuery, clientEmail: ''})
                                    setShowClientDropdown(false)
                                  }}
                                >
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add "{clientSearchQuery}" as new client
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Client Email (Auto-filled or Manual) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Client Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" 
                        type="email" 
                        placeholder="client@company.com"
                        value={form.clientEmail} 
                        onChange={(e)=>setForm({...form, clientEmail:e.target.value})}
                        disabled={selectedClient !== null}
                      />
                      {selectedClient && (
                        <p className="text-xs text-green-600 mt-1">✓ Auto-filled from selected client</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product/Service Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Product/Service Details
                  </h4>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quick Select Product (Optional)
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                      value={form.selectedProduct}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleProductSelect(e.target.value)
                        } else {
                          setForm({...form, selectedProduct: '', description: '', unitPrice: 0})
                        }
                      }}
                    >
                      <option value="">-- Select from existing products --</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ${product.price.toFixed(2)} (Stock: {product.qty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service/Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" 
                      rows={3}
                      placeholder="Describe the service or product provided..."
                      value={form.description} 
                      onChange={(e)=>setForm({...form, description:e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        type="number" 
                        min={1} 
                        value={form.quantity} 
                        onChange={(e)=>setForm({...form, quantity:e.target.value as any})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Price</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        type="number" 
                        min={0} 
                        step={0.01} 
                        placeholder="0.00"
                        value={form.unitPrice} 
                        onChange={(e)=>setForm({...form, unitPrice:e.target.value as any})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        type="number" 
                        min={0} 
                        step={0.01} 
                        placeholder="0"
                        value={form.taxRate} 
                        onChange={(e)=>setForm({...form, taxRate:e.target.value as any})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        value={form.currency} 
                        onChange={(e)=>setForm({...form, currency:e.target.value})}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Invoice Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Invoice Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        type="date" 
                        value={form.dueDate} 
                        onChange={(e)=>setForm({...form, dueDate:e.target.value})} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Payment Processing</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        form.paymentOption === 'pay_later' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setForm({...form, paymentOption: 'pay_later'})}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentOption"
                            value="pay_later"
                            checked={form.paymentOption === 'pay_later'}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">💰</span>
                              <label className="text-base font-semibold text-gray-900">Pay Later</label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Send invoice to client for payment later</p>
                          </div>
                        </div>
                      </div>

                      <div className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        form.paymentOption === 'pay_now' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setForm({...form, paymentOption: 'pay_now'})}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentOption"
                            value="pay_now"
                            checked={form.paymentOption === 'pay_now'}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">🚀</span>
                              <label className="text-base font-semibold text-gray-900">Pay Now</label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Redirect to Razorpay for immediate payment</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Preview */}
                {form.quantity && form.unitPrice && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Invoice Preview
                    </h4>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format(Number(form.quantity) * Number(form.unitPrice))}
                        </span>
                      </div>
                      {form.taxRate > 0 && (
                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                          <span className="text-gray-700">Tax ({form.taxRate}%):</span>
                          <span className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format((Number(form.quantity) * Number(form.unitPrice)) * Number(form.taxRate) / 100)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-2">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format((Number(form.quantity) * Number(form.unitPrice)) * (1 + Number(form.taxRate) / 100))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-200 rounded-b-2xl">
                <div className="flex justify-end space-x-4">
                  <button 
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" 
                    onClick={()=>setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg" 
                    onClick={createInvoice}
                    disabled={!form.clientName || !form.clientEmail || !form.description || !form.unitPrice}
                  >
                    {form.paymentOption === 'pay_now' ? (
                      <span className="flex items-center">
                        🚀 <span className="ml-2">Create & Pay Now</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        💰 <span className="ml-2">Create Invoice</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}