"use client"
import DashboardShell from '@/components/layout/DashboardShell'
import { invoiceService } from '@/services/invoiceService'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const invoiceId = searchParams.get('id')

  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  async function loadInvoice() {
    try {
      const res = await invoiceService.get(invoiceId!)
      setInvoice(res.data)
    } catch (e) {
      console.error('Failed to load invoice:', e)
      setError('Failed to load invoice details')
    } finally {
      setLoading(false)
    }
  }

  const goToInvoices = () => {
    router.push('/dashboard/invoices')
  }

  const downloadPdf = async () => {
    try {
      await invoiceService.downloadPdf(invoiceId!)
    } catch (e) {
      alert('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error || !invoice) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Invoice not found'}</p>
            <button
              onClick={goToInvoices}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Invoices
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Success Icon */}
            <div className="text-green-500 text-6xl mb-4">✅</div>
            
            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully.
            </p>

            {/* Invoice Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{invoice.client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: invoice.currency || 'INR' 
                    }).format(invoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {invoice.status}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid At:</span>
                    <span className="font-medium">
                      {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadPdf}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📄 Download PDF Receipt
              </button>
              <button
                onClick={goToInvoices}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Invoices
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-800">
                🎉 A confirmation email with the invoice PDF has been sent to {invoice.client?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
