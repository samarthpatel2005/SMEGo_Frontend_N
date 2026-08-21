'use client'

import DashboardShell from '@/components/layout/DashboardShell'
import Input from '@/components/ui/Input'
import { Transaction, transactionService } from '@/services/transactionService'
import { useEffect, useState } from 'react'

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchInvoiceTransactions()
  }, [currentPage, searchTerm, dateFilter, statusFilter])

  const fetchInvoiceTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('🔄 Fetching invoice-based transactions...')
      
      const response = await transactionService.getInvoiceTransactions({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined
      })
      
      console.log('✅ Transaction response:', response)
      let filteredTransactions = response.data || []

      // Apply date filter
      if (dateFilter !== 'all') {
        filteredTransactions = filterTransactionsByDate(filteredTransactions, dateFilter)
      }

      // Apply status filter
      if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(transaction => {
          // For invoice transactions, they are typically completed when we have payment data
          const status = transaction.paymentDate || transaction.paymentReference ? 'completed' : 'pending'
          return status === statusFilter
        })
      }

      setTransactions(filteredTransactions)
      setTotalPages(response.pagination?.pages || 1)
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions by date
  const filterTransactionsByDate = (transactions: Transaction[], filter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'today':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.paymentDate || transaction.createdAt)
          const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate())
          return transactionDay.getTime() === today.getTime()
        })
      
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.paymentDate || transaction.createdAt)
          return transactionDate >= weekAgo
        })
      
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.paymentDate || transaction.createdAt)
          return transactionDate >= monthAgo
        })
      
      default:
        return transactions
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleDateFilterChange = (filter: 'all' | 'today' | 'week' | 'month') => {
    setDateFilter(filter)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const getTransactionStatus = (transaction: Transaction) => {
    return transaction.paymentDate || transaction.paymentReference ? 'completed' : 'pending'
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'failed': 'bg-red-50 text-red-700 border-red-200',
      'refunded': 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return statusColors[status as keyof typeof statusColors] || statusColors.completed
  }

  const totalAmount = transactions.reduce((sum, t) => sum + (t.totalAmount || (t.quantity * t.unitPrice)), 0)

  // Export transactions to PDF
  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      console.log('🔄 Generating PDF export...')

      // Fetch all transactions for export (not just current page)
      const allTransactionsResponse = await transactionService.getInvoiceTransactions({
        page: 1,
        limit: 1000, // Get a large number to include all
        search: searchTerm || undefined
      })

      let allTransactions = allTransactionsResponse.data || []
      
      // Apply the same filters as the current view
      if (dateFilter !== 'all') {
        allTransactions = filterTransactionsByDate(allTransactions, dateFilter)
      }

      if (statusFilter) {
        allTransactions = allTransactions.filter(transaction => {
          // For invoice transactions, they are typically completed when we have payment data
          const status = transaction.paymentDate || transaction.paymentReference ? 'completed' : 'pending'
          return status === statusFilter
        })
      }
      
      // Create the PDF content
      const pdfContent = generatePDFContent(allTransactions)
      
      // Create and download the PDF using print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Transaction Report - ${new Date().toLocaleDateString()}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
                .report-title { font-size: 18px; color: #666; margin-bottom: 10px; }
                .report-date { font-size: 14px; color: #888; }
                .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .summary-item { text-align: center; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
                .summary-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
                .summary-value { font-size: 18px; font-weight: bold; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; color: #495057; }
                .amount { text-align: right; font-weight: bold; }
                .status-completed { background: #d4edda; color: #155724; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
                .status-pending { background: #fff3cd; color: #856404; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
                .status-failed { background: #f8d7da; color: #721c24; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
                .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                  .summary { grid-template-columns: repeat(2, 1fr); }
                }
                @page { margin: 1cm; }
              </style>
            </head>
            <body>
              ${pdfContent}
            </body>
          </html>
        `)
        printWindow.document.close()
        
        // Trigger print after content loads
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }

      console.log('✅ PDF export completed')
      
    } catch (error) {
      console.error('❌ PDF export failed:', error)
      setError('Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  // Generate PDF content HTML
  const generatePDFContent = (allTransactions: Transaction[]) => {
    const totalRevenue = allTransactions.reduce((sum, transaction) => {
      return sum + (transaction.totalAmount || (transaction.quantity * transaction.unitPrice))
    }, 0)

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Get filter description
    const getFilterDescription = () => {
      const filters = []
      if (searchTerm) filters.push(`Search: "${searchTerm}"`)
      if (dateFilter !== 'all') {
        const dateLabels = {
          today: 'Today',
          week: 'This Week',
          month: 'This Month'
        }
        filters.push(`Date: ${dateLabels[dateFilter] || dateFilter}`)
      }
      if (statusFilter) filters.push(`Status: ${statusFilter}`)
      return filters.length > 0 ? filters.join(' | ') : 'All Transactions'
    }

    return `
      <div class="header">
        <div class="company-name">SMEGo Transaction Report</div>
        <div class="report-title">Invoice Payment Transactions</div>
        <div class="report-date">Generated on ${currentDate}</div>
        ${getFilterDescription() !== 'All Transactions' ? `<div class="report-date">Filters Applied: ${getFilterDescription()}</div>` : ''}
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${allTransactions.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">${formatCurrency(totalRevenue)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Average Transaction</div>
          <div class="summary-value">${allTransactions.length > 0 ? formatCurrency(totalRevenue / allTransactions.length) : '$0.00'}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Report Period</div>
          <div class="summary-value">${getFilterDescription()}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Transaction ID</th>
            <th>Client</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${allTransactions.map(transaction => {
            const status = transaction.paymentDate || transaction.paymentReference ? 'completed' : 'pending'
            return `
            <tr>
              <td><strong>${transaction.invoiceNumber || 'N/A'}</strong></td>
              <td style="font-family: monospace; font-size: 9px;">${(transaction.transactionId || 'N/A').substring(0, 20)}${(transaction.transactionId || '').length > 20 ? '...' : ''}</td>
              <td>
                <strong>${transaction.client?.name || 'Unknown'}</strong><br>
                <small style="color: #666;">${transaction.client?.email || ''}</small>
              </td>
              <td>
                <strong>${transaction.product?.name || 'N/A'}</strong><br>
                <small style="color: #666;">SKU: ${transaction.product?.sku || 'N/A'}</small>
              </td>
              <td style="text-align: center;">${transaction.quantity}</td>
              <td class="amount">${formatCurrency(transaction.unitPrice)}</td>
              <td class="amount"><strong>${formatCurrency(transaction.totalAmount || (transaction.quantity * transaction.unitPrice))}</strong></td>
              <td>${transaction.paymentMethod || 'Razorpay'}</td>
              <td><span class="status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
              <td>${new Date(transaction.paymentDate || transaction.createdAt).toLocaleDateString()}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>SMEGo Transaction Management System</strong></p>
        <p>Report contains ${allTransactions.length} transactions | Generated on ${new Date().toLocaleString()}</p>
        ${getFilterDescription() !== 'All Transactions' ? `<p>Filters applied: ${getFilterDescription()}</p>` : ''}
      </div>
      </div>
    `
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Enhanced Header with Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l-5-5 5-5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
                <p className="text-gray-600 mt-1">Monitor and manage all invoice payments and transactions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`}
              >
                {viewMode === 'table' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 10h18M3 16h18" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={handleExportPDF}
                disabled={isExporting || transactions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-700">{transactions.length}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Avg Transaction</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {transactions.length > 0 ? formatCurrency(totalAmount / transactions.length) : '$0.00'}
                  </p>
                </div>
                <div className="p-2 bg-amber-200 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-700">98.5%</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Transactions</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder="Search by client, invoice, or transaction ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <select 
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value as any)}
              >
                <option className='text-gray-700' value="all">All Time</option>
                <option className='text-gray-700' value="today">Today</option>
                <option className='text-gray-700' value="week">This Week</option>
                <option className='text-gray-700' value="month">This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select 
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option className='text-gray-700' value="">All Status</option>
                <option className='text-gray-700' value="completed">Completed</option>
                <option className='text-gray-700' value="pending">Pending</option>
                <option className='text-gray-700' value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || dateFilter !== 'all' || statusFilter) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('all')
                  setStatusFilter('')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Transactions Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction History
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({transactions.length} transactions)
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => fetchInvoiceTransactions()}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading transactions...</h3>
              <p className="text-gray-600">Please wait while we fetch your data</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || dateFilter !== 'all' || statusFilter 
                  ? 'No transactions match your current filters. Try adjusting your search criteria.' 
                  : 'No completed invoice payments yet.'}
              </p>
              {(searchTerm || dateFilter !== 'all' || statusFilter) && (
                <button 
                  onClick={() => {
                    setSearchTerm('')
                    setDateFilter('all')
                    setStatusFilter('')
                    setCurrentPage(1)
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product & Pricing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {transaction.invoiceNumber}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Invoice
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            ID: {transaction.transactionId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {transaction.client?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.client?.name || 'Unknown Client'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.client?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.product?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {transaction.product?.sku || 'N/A'} • Qty: {transaction.quantity}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatCurrency(transaction.unitPrice)} × {transaction.quantity}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.totalAmount || (transaction.quantity * transaction.unitPrice))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.paymentMethod || 'Razorpay'}
                          </div>
                          {transaction.paymentReference && (
                            <div className="text-xs text-gray-500 font-mono">
                              {transaction.paymentReference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const status = getTransactionStatus(transaction)
                          return (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(transaction.paymentDate || transaction.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.paymentDate || transaction.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Card View
            <div className="p-6 grid gap-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {transaction.client?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{transaction.invoiceNumber}</h4>
                        <p className="text-sm text-gray-600">{transaction.client?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(transaction.totalAmount || (transaction.quantity * transaction.unitPrice))}
                      </div>
                      {(() => {
                        const status = getTransactionStatus(transaction)
                        return (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Product:</span>
                      <span className="ml-1 text-gray-900">{transaction.product?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <span className="ml-1 text-gray-900">{transaction.paymentMethod || 'Razorpay'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedTransaction.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600">Transaction ID: {selectedTransaction.transactionId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedTransaction.totalAmount || (selectedTransaction.quantity * selectedTransaction.unitPrice))}
                      </div>
                      {(() => {
                        const status = getTransactionStatus(selectedTransaction)
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status)}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.client?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.client?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Product Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.product?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedTransaction.product?.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.quantity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.unitPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.paymentMethod || 'Razorpay'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedTransaction.paymentReference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedTransaction.paymentDate || selectedTransaction.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedTransaction.totalAmount || (selectedTransaction.quantity * selectedTransaction.unitPrice))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
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

export default TransactionsPage