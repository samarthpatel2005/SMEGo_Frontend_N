'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { EmployeeWithPayroll, SalaryStructure, newPayrollService } from '@/services/newPayrollService'
import { loadRazorpayScript } from '@/lib/razorpay'
import React, { useEffect, useState } from 'react'

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const NewPayrollDashboard = () => {
  const [employees, setEmployees] = useState<EmployeeWithPayroll[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [periodMode, setPeriodMode] = useState<'month' | 'custom'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedEmployeeForPayment, setSelectedEmployeeForPayment] = useState<EmployeeWithPayroll | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [selectedEmployeeForStructure, setSelectedEmployeeForStructure] = useState<EmployeeWithPayroll | null>(null)
  const [structureForm, setStructureForm] = useState<SalaryStructure>({
    salaryType: 'monthly', salary: 0, hourlyRate: 0, bonus: 0, fixedDeduction: 0,
    leaveDeductionPerDay: 0, halfDayDeductionPerDay: 0
  })

  useEffect(() => {
    const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const monthEnd = new Date(selectedYear, selectedMonth, 0).toISOString().slice(0, 10)
    if (periodMode === 'month') {
      setCustomStartDate(monthStart)
      setCustomEndDate(monthEnd)
    }
  }, [selectedYear, selectedMonth, periodMode])

  useEffect(() => {
    fetchEmployees()
  }, [selectedYear, selectedMonth, periodMode, customStartDate, customEndDate])

  const fetchEmployees = async () => {
    if (periodMode === 'custom' && (!customStartDate || !customEndDate)) return
    setLoading(true)
    try {
      const data = await newPayrollService.getEmployeesForPayroll({
        year: selectedYear,
        month: selectedMonth,
        ...(periodMode === 'custom' && customStartDate && customEndDate
          ? { startDate: customStartDate, endDate: customEndDate }
          : {})
      })
      if (data.success) {
        setEmployees(data.data.employees || [])
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      alert(error?.message || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees)
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId)
    } else {
      newSelected.add(employeeId)
    }
    setSelectedEmployees(newSelected)
  }

  const handleSelectAll = () => {
    const eligibleEmployees = filteredEmployees.filter(emp => !emp.hasExistingPayroll && emp.hasSalaryStructure)
    if (selectedEmployees.size === eligibleEmployees.length) {
      setSelectedEmployees(new Set())
    } else {
      const allIds = eligibleEmployees
        .map(emp => emp.employee._id)
      setSelectedEmployees(new Set(allIds))
    }
  }

  const generatePayroll = async () => {
    if (selectedEmployees.size === 0) {
      alert('Please select employees to generate payroll for')
      return
    }

    setLoading(true)
    try {
      const data = await newPayrollService.generatePayrollForEmployees({
        year: selectedYear,
        month: selectedMonth,
        ...(periodMode === 'custom' ? { startDate: customStartDate, endDate: customEndDate } : {}),
        employeeIds: Array.from(selectedEmployees)
      })

      if (data.success) {
        alert('Payroll generated successfully')
        setSelectedEmployees(new Set())
        fetchEmployees()
      } else {
        alert(data.message || 'Failed to generate payroll')
      }
    } catch (error) {
      console.error('Error generating payroll:', error)
      alert('Failed to generate payroll')
    } finally {
      setLoading(false)
    }
  }

  const paySelectedEmployees = async () => {
    const employeesWithPayroll = employees.filter(emp =>
      selectedEmployees.has(emp.employee._id) &&
      emp.hasExistingPayroll &&
      emp.payrollStatus === 'approved'
    )

    if (employeesWithPayroll.length === 0) {
      alert('Please select employees with approved payroll')
      return
    }

    const payrollIds = employeesWithPayroll
      .map(emp => emp.existingPayrollId)
      .filter((id): id is string => Boolean(id))

    setPaymentProcessing(true)
    try {
      const data = await newPayrollService.createPayrollPayment({ payrollIds })

      if (data.success) {
        // Load Razorpay script first
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          alert('Failed to load payment gateway. Please try again.')
          setPaymentProcessing(false)
          return
        }

        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.data.amount * 100, // Convert to paise
          currency: data.data.currency,
          order_id: data.data.orderId,
          name: 'SMEGo Payroll',
          description: `Payroll payment for ${employeesWithPayroll.length} employees`,
          handler: async (response: any) => {
            console.log('Payment successful:', response)

            // Update local state to show paid status for selected employees
            setEmployees(prevEmployees =>
              prevEmployees.map(emp =>
                selectedEmployees.has(emp.employee._id) && emp.hasExistingPayroll
                  ? { ...emp, payrollStatus: 'paid' }
                  : emp
              )
            )

            alert('Payment completed successfully!')
            setSelectedEmployees(new Set())

            // Note: The backend webhook will update the database status to 'paid'
            // No need to fetch employees immediately as the status is already updated locally
          },
          prefill: {
            name: 'Admin',
            email: 'admin@company.com'
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              setPaymentProcessing(false)
            }
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        alert(data.message || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Failed to create payment')
    } finally {
      setPaymentProcessing(false)
    }
  }

  const resetPayrollStatus = async () => {
    const paidEmployees = employees.filter(emp => emp.payrollStatus === 'paid')

    if (paidEmployees.length === 0) {
      alert('No paid payrolls to reset')
      return
    }

    const payrollIds = paidEmployees
      .map(emp => emp.existingPayrollId)
      .filter((id): id is string => Boolean(id))

    if (confirm(`Are you sure you want to reset ${paidEmployees.length} paid payroll(s) back to approved status? This will allow them to be paid again.`)) {
      try {
        const data = await newPayrollService.resetPayrollStatus(payrollIds)
        if (data.success) {
          alert(`${data.modifiedCount} payroll records reset successfully to approved status`)
          fetchEmployees() // Refresh to show updated status
        }
      } catch (error) {
        console.error('Error resetting payroll status:', error)
        alert('Failed to reset payroll status')
      }
    }
  }

  const processIndividualPayment = async () => {
    if (!selectedEmployeeForPayment) return

    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount < 1) {
      alert('Please enter a valid amount (minimum ₹1)')
      return
    }

    console.log('Processing payment for employee:', selectedEmployeeForPayment.employee.fullName)
    console.log('Payment amount:', amount)
    console.log('Payroll ID:', selectedEmployeeForPayment.existingPayrollId)

    setPaymentProcessing(true)
    try {
      // Create a payment request with custom amount
      const data = await newPayrollService.createPayrollPayment({
        payrollIds: [selectedEmployeeForPayment.existingPayrollId!],
        customAmount: amount
      })

      console.log('Payment creation response:', data)

      if (data.success) {
        setShowPaymentModal(false)

        // Load Razorpay script first
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          alert('Failed to load payment gateway. Please try again.')
          setPaymentProcessing(false)
          return
        }

        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          order_id: data.data.orderId,
          name: 'SMEGo Payroll',
          description: `Payroll payment for ${selectedEmployeeForPayment.employee.fullName}`,
          handler: async (response: any) => {
            console.log('Payment successful:', response)

            // Update the local state to show PAID status immediately
            setEmployees(prevEmployees =>
              prevEmployees.map(emp =>
                emp.employee._id === selectedEmployeeForPayment.employee._id
                  ? { ...emp, payrollStatus: 'paid' }
                  : emp
              )
            )

            alert('Payment completed successfully!')
            setSelectedEmployeeForPayment(null)
            setCustomAmount('')

            // Note: The backend webhook will update the database status to 'paid'
            // No need to fetch employees immediately as the status is already updated locally
          },
          prefill: {
            name: selectedEmployeeForPayment.employee.fullName,
            email: selectedEmployeeForPayment.employee.email
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              setPaymentProcessing(false)
            }
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        alert(data.message || 'Failed to create payment')
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)

      // Enhanced error logging to help debug
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: error.message || 'No error message',
          response: error.response?.data || 'No response data',
          status: error.response?.status || 'No status',
          stack: error.stack || 'No stack trace'
        })
      }

      // Show more informative error message
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to create payment. Please check your connection and try again.'
      alert(errorMessage)
    } finally {
      setPaymentProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1]
  }

  const periodLabel = periodMode === 'custom'
    ? `${customStartDate || 'Start date'} to ${customEndDate || 'End date'}`
    : `${getMonthName(selectedMonth)} ${selectedYear}`

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string, text: string, icon: string } } = {
      not_generated: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '⏳' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💰' },
      draft: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '📝' }
    }

    const config = statusConfig[status] || statusConfig.not_generated

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border border-opacity-20`}>
        <span className="text-sm">{config.icon}</span>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const openStructureModal = (employee: EmployeeWithPayroll) => {
    const structure = employee.employee.salaryStructure
    const structureSalary = structure?.salary || employee.employee.salary || 0
    const suggestedDailySalary = structureSalary / Math.max(employee.attendance.totalDays, 1)
    const suggestedHourlyHalfDayDeduction = (structure?.hourlyRate || employee.employee.hourlyRate || 0) * 4
    setSelectedEmployeeForStructure(employee)
    setStructureForm({
      salaryType: structure?.salaryType || 'monthly',
      salary: structure?.salary || employee.employee.salary || 0,
      hourlyRate: structure?.hourlyRate || employee.employee.hourlyRate || 0,
      bonus: structure?.bonus || 0,
      fixedDeduction: structure?.fixedDeduction || 0,
      leaveDeductionPerDay: structure?.leaveDeductionPerDay ?? suggestedDailySalary,
      halfDayDeductionPerDay: structure?.halfDayDeductionPerDay ?? (
        (structure?.salaryType || 'monthly') === 'hourly'
          ? suggestedHourlyHalfDayDeduction
          : suggestedDailySalary * 0.5
      )
    })
    setShowStructureModal(true)
  }

  const saveStructure = async () => {
    if (!selectedEmployeeForStructure) return
    try {
      await newPayrollService.updateSalaryStructure(selectedEmployeeForStructure.employee._id, structureForm)
      setShowStructureModal(false)
      setSelectedEmployeeForStructure(null)
      await fetchEmployees()
      alert('Salary structure saved successfully')
    } catch (error: any) {
      alert(error?.message || 'Failed to save salary structure')
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedEmployeesData = employees.filter(emp => selectedEmployees.has(emp.employee._id))
  const totalSelectedAmount = selectedEmployeesData.reduce((sum, emp) => {
    const amount = emp.payrollData?.netSalary || emp.payrollData?.baseSalary || emp.employee.salary || 1000
    return sum + amount
  }, 0)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">💼</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Payroll Management
                  </h1>
                  <p className="text-slate-600 text-lg">Streamlined payroll processing with attendance integration</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={fetchEmployees}
                variant="outline"
                className="group text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm"
              >
                <span className="mr-2 group-hover:rotate-180 transition-transform duration-300">🔄</span>
                Refresh Data
              </Button>
              <Button
                onClick={resetPayrollStatus}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium shadow-sm"
              >
                <span className="mr-2">🔄</span>
                Reset Status
              </Button>
              {selectedEmployees.size > 0 && (
                <div className="flex gap-3 animate-in slide-in-from-right duration-300">
                  <Button
                    onClick={generatePayroll}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">⚡</span>
                    Generate ({selectedEmployees.size})
                  </Button>
                  <Button
                    onClick={paySelectedEmployees}
                    disabled={paymentProcessing}
                    className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">💳</span>
                    {paymentProcessing ? 'Processing...' : `Pay ${formatCurrency(totalSelectedAmount)}`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📅</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payroll Period</h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value as 'month' | 'custom')}
                className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700"
              >
                <option value="month">Monthly period</option>
                <option value="custom">Custom dates</option>
              </select>
              {periodMode === 'custom' && <>
                <label className="text-sm font-semibold text-slate-600">From
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="ml-2 border-2 border-slate-200 rounded-xl px-3 py-3 font-medium text-slate-700" />
                </label>
                <label className="text-sm font-semibold text-slate-600">To
                  <input type="date" value={customEndDate} min={customStartDate} onChange={(e) => setCustomEndDate(e.target.value)} className="ml-2 border-2 border-slate-200 rounded-xl px-3 py-3 font-medium text-slate-700" />
                </label>
              </>}
              {periodMode === 'month' && <>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium text-slate-700 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium text-slate-700 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Employees</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{filteredEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-slate-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Selected</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{selectedEmployees.size}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Amount</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(totalSelectedAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-emerald-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">With Payroll</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {filteredEmployees.filter(emp => emp.hasExistingPayroll).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="whitespace-nowrap font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 px-6 py-3 rounded-xl shadow-sm"
            >
              <span className="mr-2">
                {selectedEmployees.size === filteredEmployees.filter(emp => !emp.hasExistingPayroll && emp.hasSalaryStructure).length ? '❌' : '☑️'}
              </span>
              {selectedEmployees.size === filteredEmployees.filter(emp => !emp.hasExistingPayroll && emp.hasSalaryStructure).length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </div>
        </div>

        {/* Enhanced Employee List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">👨‍💼</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Employees for {periodLabel}
              </h3>
              <span className="ml-auto px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                {filteredEmployees.length} employees
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-600 text-xl">⚡</span>
                  </div>
                </div>
                <p className="text-slate-600 mt-4 font-medium">Loading employee data...</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.size === filteredEmployees.filter(emp => !emp.hasExistingPayroll && emp.hasSalaryStructure).length && filteredEmployees.filter(emp => !emp.hasExistingPayroll && emp.hasSalaryStructure).length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 transition-all"
                          />
                          <span>Select</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee Details</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Attendance</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Base Salary</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Net Salary</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp, index) => (
                      <tr key={emp.employee._id} className="hover:bg-slate-50 transition-all duration-200 group">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.has(emp.employee._id)}
                            onChange={() => handleSelectEmployee(emp.employee._id)}
                            disabled={!emp.hasSalaryStructure || (emp.hasExistingPayroll && emp.payrollStatus === 'paid')}
                            className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 transition-all disabled:opacity-50"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                              {emp.employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{emp.employee.fullName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                                  {emp.employee.employeeId}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-sm text-slate-600 font-medium">{emp.employee.department}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {emp.employee.salaryStructure?.salaryType === 'hourly' ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-slate-700">{emp.attendance.totalHours}h worked</span>
                                </div>
                                <div className="text-xs text-slate-500">Regular: {emp.attendance.regularHours}h</div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-slate-700">{emp.attendance.presentDays} days worked</span>
                                </div>
                                <div className="text-xs text-slate-600">Half-days: {emp.attendance.halfDays}</div>
                                <div className="text-xs text-slate-600">Absent: {emp.attendance.absentDays}</div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 text-lg">
                            {formatCurrency(emp.payrollData?.baseSalary || emp.employee.salary || (emp.employee.hourlyRate || 0) * emp.attendance.totalHours)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-emerald-600 text-lg">
                            {formatCurrency(emp.payrollData?.netSalary || emp.payrollData?.baseSalary || emp.employee.salary || 1000)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col items-start gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openStructureModal(emp)}
                              className="text-blue-700 border-blue-300 hover:bg-blue-50 rounded-xl"
                            >
                              {emp.hasSalaryStructure ? 'Edit Structure' : 'Set Structure'}
                            </Button>
                            {emp.payrollStatus === 'approved' ? (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 group"
                                onClick={() => {
                                  setSelectedEmployeeForPayment(emp)
                                  const defaultAmount = emp.payrollData?.netSalary || emp.payrollData?.baseSalary || emp.employee.salary || 1000
                                  setCustomAmount(defaultAmount.toString())
                                  setShowPaymentModal(true)
                                }}
                              >
                                <span className="mr-2 group-hover:scale-110 transition-transform">💳</span>
                                Pay Now
                              </Button>
                            ) : emp.payrollStatus === 'paid' ? (
                              <div className="flex items-center gap-2">
                                <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-2 border-emerald-200 shadow-sm">
                                  <span className="mr-2">✅</span>
                                  PAID
                                </span>
                              </div>
                            ) : (
                              getStatusBadge(emp.payrollStatus)
                            )}
                            {!emp.hasSalaryStructure && <span className="text-xs text-amber-700 font-medium">Structure required</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-slate-400 text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No employees found</h3>
                <p className="text-slate-500">No employees found for this period. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Payment Modal */}
        {showPaymentModal && selectedEmployeeForPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-2xl border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">💳</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Process Payment</h3>
                    <p className="text-slate-600 text-sm">Secure payment processing</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Employee Info Card */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                      {selectedEmployeeForPayment.employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{selectedEmployeeForPayment.employee.fullName}</p>
                      <p className="text-sm text-slate-600">{selectedEmployeeForPayment.employee.employeeId} • {selectedEmployeeForPayment.employee.department}</p>
                    </div>
                  </div>
                </div>

                {/* Calculated Amount Display */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-medium">Calculated Net Salary:</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {formatCurrency(selectedEmployeeForPayment.payrollData?.netSalary || selectedEmployeeForPayment.payrollData?.baseSalary || selectedEmployeeForPayment.employee.salary || 1000)}
                    </span>
                  </div>
                </div>

                {/* Payment Amount Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">₹</span>
                    </div>
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                      className="pl-8 py-3 text-lg font-medium border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-amber-500">⚠️</span>
                    Minimum payment amount: ₹1
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 bg-slate-50 rounded-b-2xl border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedEmployeeForPayment(null)
                    setCustomAmount('')
                  }}
                  className="px-6 py-3 font-semibold text-slate-700 border-slate-300 hover:bg-white hover:border-slate-400 transition-all duration-200 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={processIndividualPayment}
                  disabled={paymentProcessing || !customAmount || parseFloat(customAmount) < 1}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      Pay {customAmount ? formatCurrency(parseFloat(customAmount)) : 'Now'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showStructureModal && selectedEmployeeForStructure && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedEmployeeForStructure.hasSalaryStructure ? 'Edit' : 'Set'} Salary Structure
                </h3>
                <p className="text-sm text-slate-600 mt-1">{selectedEmployeeForStructure.employee.fullName}</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-slate-700">Pay type
                  <select value={structureForm.salaryType} onChange={e => setStructureForm({ ...structureForm, salaryType: e.target.value as 'monthly' | 'hourly' })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                    <option value="monthly">Monthly salary</option>
                    <option value="hourly">Hourly salary</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">{structureForm.salaryType === 'monthly' ? 'Monthly salary' : 'Hourly rate'}
                  <Input type="number" min="0" value={structureForm.salaryType === 'monthly' ? structureForm.salary : structureForm.hourlyRate} onChange={e => setStructureForm({ ...structureForm, [structureForm.salaryType === 'monthly' ? 'salary' : 'hourlyRate']: Number(e.target.value) })} className="mt-1" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Bonus
                  <Input type="number" min="0" value={structureForm.bonus} onChange={e => setStructureForm({ ...structureForm, bonus: Number(e.target.value) })} className="mt-1" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Fixed deduction
                  <Input type="number" min="0" value={structureForm.fixedDeduction} onChange={e => setStructureForm({ ...structureForm, fixedDeduction: Number(e.target.value) })} className="mt-1" />
                </label>
                {structureForm.salaryType === 'monthly' && <>
                  <label className="text-sm font-semibold text-slate-700">Leave deduction per day
                    <Input type="number" min="0" value={structureForm.leaveDeductionPerDay} onChange={e => setStructureForm({ ...structureForm, leaveDeductionPerDay: Number(e.target.value) })} className="mt-1" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Half-day deduction
                    <Input type="number" min="0" value={structureForm.halfDayDeductionPerDay} onChange={e => setStructureForm({ ...structureForm, halfDayDeductionPerDay: Number(e.target.value) })} className="mt-1" />
                  </label>
                </>}
                <div className="sm:col-span-2 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                  Attendance suggestion: {selectedEmployeeForStructure.attendance.presentDays} present days, {selectedEmployeeForStructure.attendance.absentDays} absent days, and {selectedEmployeeForStructure.attendance.halfDays} half-days.
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200">
                <Button variant="outline" onClick={() => setShowStructureModal(false)}>Cancel</Button>
                <Button onClick={saveStructure} className="bg-blue-600 text-white hover:bg-blue-700">Save Structure</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewPayrollDashboard