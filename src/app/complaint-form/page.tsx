'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { AlertCircle, CheckCircle, FileText, Mail, Phone } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ComplaintForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: 'other',
    invoiceNumber: '',
    organizationId: ''
  })

  useEffect(() => {
    // Pre-populate form from URL parameters
    const invoice = searchParams.get('invoice')
    const org = searchParams.get('org')
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    console.log('URL Parameters:', { invoice, org, email, name })

    setFormData(prev => ({
      ...prev,
      invoiceNumber: invoice || '',
      organizationId: org || '',
      clientEmail: email ? decodeURIComponent(email) : '',
      clientName: name ? decodeURIComponent(name) : ''
    }))
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Basic validation
    if (!formData.clientName.trim() || !formData.clientEmail.trim() || 
        !formData.subject.trim() || !formData.description.trim() || 
        !formData.organizationId.trim()) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      console.log('Submitting complaint with data:', formData)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/complaints/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)

      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.message || 'Failed to submit complaint. Please try again.')
      }
    } catch (err) {
      console.error('Complaint submission error:', err)
      setError('Failed to submit complaint. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const categoryOptions = [
    { value: 'billing', label: 'Billing' },
    { value: 'service', label: 'Service' },
    { value: 'technical', label: 'Technical' },
    { value: 'product', label: 'Product' },
    { value: 'other', label: 'Other' }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your complaint has been submitted successfully. We will review it and get back to you soon.
            </p>
            <Button 
              onClick={() => window.close()} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Submit a Complaint or Inquiry</h1>
            </div>
            <p className="text-blue-100">
              We value your feedback. Please provide details about your concern and we'll address it promptly.
            </p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-red-700 text-sm">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    Full Name *
                  </Label>
                  <Input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="Your phone number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    Invoice Number
                  </Label>
                  <Input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    placeholder="e.g., INV-001"
                  />
                </div>
              </div>

              {/* Complaint Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Priority Level"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    options={priorityOptions}
                    placeholder="Select priority"
                  />
                </div>

                <div>
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    options={categoryOptions}
                    placeholder="Select category"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Subject *
                </Label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your concern"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Detailed Description *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide detailed information about your complaint or inquiry..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
                <Button
                  type="button"
                  onClick={() => window.close()}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
