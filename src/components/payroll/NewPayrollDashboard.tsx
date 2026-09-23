'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  EmployeeWithPayroll,
  PayrollSummaryEmployee,
  PayrollSummaryResponse,
  SalaryStructure,
  newPayrollService
} from '@/services/newPayrollService'
import { loadRazorpayScript } from '@/lib/razorpay'
import React, { useEffect, useState } from 'react'

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Salary Breakdown Card ────────────────────────────────────────────────────
const SalaryBreakdownCard = ({
  emp,
  summaryRow,
  formatCurrency,
}: {
  emp: EmployeeWithPayroll
  summaryRow?: PayrollSummaryEmployee
  formatCurrency: (n: number) => string
}) => {
  const pd = emp.payrollData
  const monthly = emp.employee.salaryStructure?.salary || emp.employee.salary || 0
  const totalDays = emp.attendance.totalDays || 30
  const perDay = pd?.perDaySalary ?? (monthly / totalDays)
  const effective = pd?.effectiveDays ?? (emp.attendance.presentDays + emp.attendance.halfDays * 0.5)
  const earned = pd?.earnedBasicSalary ?? (perDay * effective)
  const absentDed = pd?.absentDeduction ?? (perDay * emp.attendance.absentDays)
  const leaveDed = pd?.deductions?.leaveDeduction ?? (perDay * emp.attendance.leaveDays)
  const bonus = emp.employee.salaryStructure?.bonus || 0
  const net = pd?.netSalary ?? (earned + bonus - absentDed - leaveDed)

  const presentPct = totalDays > 0 ? (emp.attendance.presentDays / totalDays) * 100 : 0
  const absentPct = totalDays > 0 ? (emp.attendance.absentDays / totalDays) * 100 : 0
  const halfPct = totalDays > 0 ? (emp.attendance.halfDays / totalDays) * 100 : 0
  const leavePct = totalDays > 0 ? (emp.attendance.leaveDays / totalDays) * 100 : 0

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4 space-y-3">
      {/* Per-day rate pill */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auto Per-Day Rate</span>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
          {formatCurrency(perDay)}/day
        </span>
      </div>

      {/* Attendance bar */}
      <div>
        <div className="flex text-xs text-slate-500 justify-between mb-1">
          <span>{totalDays} days in period</span>
          <span>{emp.attendance.presentDays}P · {emp.attendance.absentDays}A · {emp.attendance.halfDays}H · {emp.attendance.leaveDays}L</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${presentPct}%` }} title={`Present: ${emp.attendance.presentDays}`} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${halfPct}%` }} title={`Half-day: ${emp.attendance.halfDays}`} />
          <div className="bg-sky-400 h-full transition-all" style={{ width: `${leavePct}%` }} title={`Leave: ${emp.attendance.leaveDays}`} />
          <div className="bg-red-400 h-full transition-all" style={{ width: `${absentPct}%` }} title={`Absent: ${emp.attendance.absentDays}`} />
        </div>
        <div className="flex gap-3 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Present</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Half</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />Leave</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Absent</span>
        </div>
      </div>

      {/* Salary breakdown rows */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-emerald-700">
          <span>Earned ({effective} days × {formatCurrency(perDay)})</span>
          <span className="font-semibold">+{formatCurrency(earned)}</span>
        </div>
        {bonus > 0 && (
          <div className="flex justify-between text-purple-700">
            <span>Bonus</span>
            <span className="font-semibold">+{formatCurrency(bonus)}</span>
          </div>
        )}
        {absentDed > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Absent deduction ({emp.attendance.absentDays} days)</span>
            <span className="font-semibold">−{formatCurrency(absentDed)}</span>
          </div>
        )}
        {leaveDed > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Leave deduction ({emp.attendance.leaveDays} days)</span>
            <span className="font-semibold">−{formatCurrency(leaveDed)}</span>
          </div>
        )}
        <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-slate-800">
          <span>Net Payable</span>
          <span className="text-emerald-700">{formatCurrency(net)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const NewPayrollDashboard = () => {
  const [employees, setEmployees] = useState<EmployeeWithPayroll[]>([])
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummaryResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
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
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'employees' | 'summary'>('employees')

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
    fetchSummary()
  }, [selectedYear, selectedMonth, periodMode, customStartDate, customEndDate])

  const getPeriodParams = () => ({
    year: selectedYear,
    month: selectedMonth,
    ...(periodMode === 'custom' && customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : {})
  })

  const fetchEmployees = async () => {
    if (periodMode === 'custom' && (!customStartDate || !customEndDate)) return
    setLoading(true)
    try {
      const data = await newPayrollService.getEmployeesForPayroll(getPeriodParams())
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

  const fetchSummary = async () => {
    if (periodMode === 'custom' && (!customStartDate || !customEndDate)) return
    setSummaryLoading(true)
    try {
      const data = await newPayrollService.getPayrollSummary(getPeriodParams())
      if (data.success) {
        setPayrollSummary(data.data)
      }
    } catch {
      // Summary not critical; silently fail
    } finally {
      setSummaryLoading(false)
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
      setSelectedEmployees(new Set(eligibleEmployees.map(emp => emp.employee._id)))
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
        fetchSummary()
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
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          alert('Failed to load payment gateway. Please try again.')
          setPaymentProcessing(false)
          return
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.data.amount * 100,
          currency: data.data.currency,
          order_id: data.data.orderId,
          name: 'SMEGo Payroll',
          description: `Payroll payment for ${employeesWithPayroll.length} employees`,
          handler: async (response: any) => {
            console.log('Payment successful:', response)
            try {
              // Call verify endpoint to mark payrolls as paid in DB
              await newPayrollService.verifyPayrollPayment({
                payrollIds,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || ''
              })
            } catch (verifyErr) {
              console.warn('Verify call failed, updating UI optimistically', verifyErr)
            }
            setEmployees(prev =>
              prev.map(emp =>
                selectedEmployees.has(emp.employee._id) && emp.hasExistingPayroll
                  ? { ...emp, payrollStatus: 'paid' }
                  : emp
              )
            )
            alert('Payment completed successfully!')
            setSelectedEmployees(new Set())
            fetchEmployees()
            fetchSummary()
          },
          prefill: { name: 'Admin', email: 'admin@company.com' },
          theme: { color: '#4F46E5' },
          modal: { ondismiss: () => setPaymentProcessing(false) }
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
    const payrollIds = paidEmployees.map(emp => emp.existingPayrollId).filter((id): id is string => Boolean(id))
    if (confirm(`Are you sure you want to reset ${paidEmployees.length} paid payroll(s) back to approved status?`)) {
      try {
        const data = await newPayrollService.resetPayrollStatus(payrollIds)
        if (data.success) {
          alert(`${data.modifiedCount} payroll records reset successfully`)
          fetchEmployees()
          fetchSummary()
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
    setPaymentProcessing(true)
    try {
      const data = await newPayrollService.createPayrollPayment({
        payrollIds: [selectedEmployeeForPayment.existingPayrollId!],
        customAmount: amount
      })
      if (data.success) {
        setShowPaymentModal(false)
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          alert('Failed to load payment gateway. Please try again.')
          setPaymentProcessing(false)
          return
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(amount * 100),
          currency: 'INR',
          order_id: data.data.orderId,
          name: 'SMEGo Payroll',
          description: `Payroll payment for ${selectedEmployeeForPayment.employee.fullName}`,
          handler: async (response: any) => {
            console.log('Payment successful:', response)
            try {
              // Call verify endpoint to mark payroll as paid in DB (works in test mode)
              await newPayrollService.verifyPayrollPayment({
                payrollIds: [selectedEmployeeForPayment.existingPayrollId!],
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || ''
              })
            } catch (verifyErr) {
              console.warn('Verify call failed, updating UI optimistically', verifyErr)
            }
            setEmployees(prev =>
              prev.map(emp =>
                emp.employee._id === selectedEmployeeForPayment.employee._id
                  ? { ...emp, payrollStatus: 'paid' }
                  : emp
              )
            )
            alert('Payment completed successfully!')
            setSelectedEmployeeForPayment(null)
            setCustomAmount('')
            fetchEmployees()
            fetchSummary()
          },
          prefill: {
            name: selectedEmployeeForPayment.employee.fullName,
            email: selectedEmployeeForPayment.employee.email
          },
          theme: { color: '#4F46E5' },
          modal: { ondismiss: () => setPaymentProcessing(false) }
        }
        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        alert(data.message || 'Failed to create payment')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create payment.'
      alert(errorMessage)
    } finally {
      setPaymentProcessing(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const getMonthName = (month: number) =>
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1]

  const periodLabel = periodMode === 'custom'
    ? `${customStartDate || 'Start'} → ${customEndDate || 'End'}`
    : `${getMonthName(selectedMonth)} ${selectedYear}`

  const getStatusConfig = (status: string) => {
    const map: { [k: string]: { bg: string; text: string; icon: string; label: string } } = {
      not_generated: { bg: 'bg-slate-100', text: 'text-slate-600', icon: '⏳', label: 'Not Generated' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅', label: 'Approved' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💰', label: 'Paid' },
      draft: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '📝', label: 'Draft' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌', label: 'Rejected' },
    }
    return map[status] || map.not_generated
  }

  const openStructureModal = (employee: EmployeeWithPayroll) => {
    const structure = employee.employee.salaryStructure
    const monthlySalary = structure?.salary || employee.employee.salary || 0
    const totalDays = employee.attendance.totalDays || 30
    const autoDailyRate = monthlySalary / totalDays
    setSelectedEmployeeForStructure(employee)
    setStructureForm({
      salaryType: structure?.salaryType || 'monthly',
      salary: monthlySalary,
      hourlyRate: structure?.hourlyRate || employee.employee.hourlyRate || 0,
      bonus: structure?.bonus || 0,
      fixedDeduction: structure?.fixedDeduction || 0,
      // 0 = auto (will use monthlySalary / totalDays)
      leaveDeductionPerDay: structure?.leaveDeductionPerDay ?? 0,
      halfDayDeductionPerDay: structure?.halfDayDeductionPerDay ?? 0,
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
      await fetchSummary()
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
    const amount = emp.payrollData?.netSalary || emp.payrollData?.baseSalary || emp.employee.salary || 0
    return sum + amount
  }, 0)

  // Derived for summary cards
  const totalMonthlyPayable = payrollSummary?.totals.totalPayable ?? 0
  const totalAbsentDeductions = payrollSummary?.totals.totalAbsentDeduction ?? 0
  const totalEmployeesWithStructure = filteredEmployees.filter(e => e.hasSalaryStructure).length
  const paidCount = filteredEmployees.filter(e => e.payrollStatus === 'paid').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-2xl">💼</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Payroll Management</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Attendance-based · Auto absent deduction · {periodLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { fetchEmployees(); fetchSummary() }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                🔄 Refresh
              </button>
              <button
                onClick={resetPayrollStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-600 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-all"
              >
                ↩ Reset Status
              </button>
              {selectedEmployees.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={generatePayroll}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    ⚡ Generate ({selectedEmployees.size})
                  </button>
                  <button
                    onClick={paySelectedEmployees}
                    disabled={paymentProcessing}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                  >
                    💳 {paymentProcessing ? 'Processing…' : `Pay ${formatCurrency(totalSelectedAmount)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Period Selector ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-base">📅</span>
              </div>
              <span className="font-bold text-slate-700">Period</span>
            </div>

            <select
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value as 'month' | 'custom')}
              className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-400 outline-none transition"
            >
              <option value="month">Monthly</option>
              <option value="custom">Custom dates</option>
            </select>

            {periodMode === 'month' && <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-400 outline-none transition"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-400 outline-none transition"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>}

            {periodMode === 'custom' && <>
              <label className="text-sm font-medium text-slate-600">
                From&nbsp;
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
                  className="ml-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
              </label>
              <label className="text-sm font-medium text-slate-600">
                To&nbsp;
                <input type="date" value={customEndDate} min={customStartDate} onChange={e => setCustomEndDate(e.target.value)}
                  className="ml-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
              </label>
            </>}

            {/* Attendance-based badge */}
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
              Auto Absent Deduction ON
            </span>
          </div>
        </div>

        {/* ── Summary KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Payable', value: formatCurrency(totalMonthlyPayable),
              icon: '💰', grad: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-700',
              sub: `${payrollSummary?.totals.employeeCount ?? 0} employees`
            },
            {
              label: 'Absent Deductions', value: formatCurrency(totalAbsentDeductions),
              icon: '📉', grad: 'from-red-400 to-rose-500', textColor: 'text-red-700',
              sub: `${payrollSummary?.totals.totalAbsentDays ?? 0} absent days`
            },
            {
              label: 'With Structure', value: String(totalEmployeesWithStructure),
              icon: '📋', grad: 'from-blue-400 to-indigo-500', textColor: 'text-blue-700',
              sub: `of ${filteredEmployees.length} employees`
            },
            {
              label: 'Paid This Period', value: String(paidCount),
              icon: '✅', grad: 'from-purple-400 to-violet-500', textColor: 'text-purple-700',
              sub: 'completed'
            },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-extrabold mt-1.5 ${card.textColor}`}>{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-lg">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'employees', label: '👥 Employee Payroll' },
            { id: 'summary', label: '📊 Period Summary' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-md'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Employee Payroll Tab ─────────────────────────────────────────── */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
            {/* Table header / search */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder="Search employee name or ID…"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-indigo-400"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                {selectedEmployees.size === filteredEmployees.filter(e => !e.hasExistingPayroll && e.hasSalaryStructure).length ? '❌ Deselect All' : '☑️ Select All'}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 mt-4 font-medium">Loading payroll data…</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const sc = getStatusConfig(emp.payrollStatus)
                  const isExpanded = expandedEmployee === emp.employee._id
                  const monthly = emp.employee.salaryStructure?.salary || emp.employee.salary || 0
                  const totalDays = emp.attendance.totalDays || 30
                  const perDay = emp.payrollData?.perDaySalary ?? (monthly / totalDays)
                  const effectiveDays = emp.payrollData?.effectiveDays ?? (emp.attendance.presentDays + emp.attendance.halfDays * 0.5)
                  const net = emp.payrollData?.netSalary ?? (perDay * effectiveDays + (emp.employee.salaryStructure?.bonus || 0))

                  return (
                    <div key={emp.employee._id} className={`transition-all duration-200 ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}>
                      {/* Main row */}
                      <div className="px-5 py-4 flex items-center gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(emp.employee._id)}
                          onChange={() => handleSelectEmployee(emp.employee._id)}
                          disabled={!emp.hasSalaryStructure || emp.payrollStatus === 'paid'}
                          className="w-4.5 h-4.5 text-indigo-600 border-2 border-slate-300 rounded focus:ring-indigo-500 transition disabled:opacity-40"
                        />

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                          {emp.employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 text-sm">{emp.employee.fullName}</p>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs">{emp.employee.employeeId}</span>
                            {emp.employee.department && (
                              <span className="text-xs text-slate-400">{emp.employee.department}</span>
                            )}
                          </div>
                          {/* Quick attendance line */}
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              {emp.attendance.presentDays} present
                            </span>
                            {emp.attendance.absentDays > 0 && (
                              <span className="flex items-center gap-1 text-red-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                {emp.attendance.absentDays} absent
                              </span>
                            )}
                            {emp.attendance.halfDays > 0 && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                {emp.attendance.halfDays} half-day
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Per-day rate */}
                        {emp.hasSalaryStructure && (
                          <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-slate-400">Per day</span>
                            <span className="text-sm font-bold text-indigo-600">{formatCurrency(perDay)}</span>
                          </div>
                        )}

                        {/* Net salary */}
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs text-slate-400">Net payable</span>
                          <span className="text-sm font-extrabold text-emerald-700">{formatCurrency(net)}</span>
                        </div>

                        {/* Status badge */}
                        <span className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                          {sc.icon} {sc.label}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openStructureModal(emp)}
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all"
                          >
                            {emp.hasSalaryStructure ? '✏️ Edit' : '➕ Set Structure'}
                          </button>
                          {emp.payrollStatus === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedEmployeeForPayment(emp)
                                const defaultAmount = emp.payrollData?.netSalary || emp.employee.salary || 0
                                setCustomAmount(defaultAmount.toString())
                                setShowPaymentModal(true)
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg shadow-sm hover:from-emerald-700 hover:to-green-700 transition-all"
                            >
                              💳 Pay
                            </button>
                          )}
                          {emp.payrollStatus === 'paid' && (
                            <span className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100 rounded-lg">✅ PAID</span>
                          )}
                          {/* Expand toggle */}
                          {emp.hasSalaryStructure && (
                            <button
                              onClick={() => setExpandedEmployee(isExpanded ? null : emp.employee._id)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded salary breakdown */}
                      {isExpanded && emp.hasSalaryStructure && (
                        <div className="px-5 pb-5">
                          <SalaryBreakdownCard emp={emp} formatCurrency={formatCurrency} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-slate-400 text-3xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-600">No employees found</h3>
                <p className="text-slate-400 text-sm mt-1">Try adjusting the period or search term.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Period Summary Tab ───────────────────────────────────────────── */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
            {summaryLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 mt-4 font-medium">Computing payroll summary…</p>
              </div>
            ) : payrollSummary && payrollSummary.employees.length > 0 ? (
              <>
                {/* Totals banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-6 text-white">
                  <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">Period Overview — {periodLabel}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                      { label: 'Total Payable', value: formatCurrency(payrollSummary.totals.totalPayable) },
                      { label: 'Absent Deductions', value: formatCurrency(payrollSummary.totals.totalAbsentDeduction) },
                      { label: 'Leave Deductions', value: formatCurrency(payrollSummary.totals.totalLeaveDeduction) },
                      { label: 'Total Bonus', value: formatCurrency(payrollSummary.totals.totalBonus) },
                    ].map(t => (
                      <div key={t.label} className="bg-white/10 rounded-xl p-3">
                        <p className="text-indigo-200 text-xs">{t.label}</p>
                        <p className="text-white font-extrabold text-lg mt-0.5">{t.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-employee breakdown table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Employee', 'Monthly Salary', 'Per Day', `Period Days (${payrollSummary.period.totalDays})`, 'Present', 'Absent', 'Half', 'Earned', '− Absent Ded', '− Leave Ded', '+ Bonus', 'Net Payable'].map(h => (
                          <th key={h} className="py-3 px-4 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payrollSummary.employees.map(row => (
                        <tr key={row.employee._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-slate-800">{row.employee.fullName}</p>
                              <p className="text-xs text-slate-400">{row.employee.department}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">{formatCurrency(row.monthlySalary)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold">
                              {formatCurrency(row.perDaySalary)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{row.totalDaysInPeriod}</td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-700 font-semibold">{row.presentDays}</span>
                            {row.halfDays > 0 && <span className="text-amber-500 text-xs ml-1">+{row.halfDays}h</span>}
                          </td>
                          <td className="py-3 px-4">
                            {row.absentDays > 0
                              ? <span className="text-red-600 font-semibold">{row.absentDays}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4 text-amber-600">{row.halfDays || '—'}</td>
                          <td className="py-3 px-4 text-emerald-700 font-medium">{formatCurrency(row.earnedSalary)}</td>
                          <td className="py-3 px-4">
                            {row.absentDeduction > 0
                              ? <span className="text-red-500 font-medium">−{formatCurrency(row.absentDeduction)}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            {row.leaveDeduction > 0
                              ? <span className="text-orange-500 font-medium">−{formatCurrency(row.leaveDeduction)}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            {row.bonus > 0
                              ? <span className="text-purple-600 font-medium">+{formatCurrency(row.bonus)}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-emerald-700 text-base">{formatCurrency(row.netPayable)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Grand total row */}
                    <tfoot className="bg-slate-800 text-white">
                      <tr>
                        <td className="py-3 px-4 font-bold">TOTAL</td>
                        <td colSpan={6} />
                        <td className="py-3 px-4 font-bold text-emerald-300">
                          {formatCurrency(payrollSummary.employees.reduce((s, r) => s + r.earnedSalary, 0))}
                        </td>
                        <td className="py-3 px-4 font-bold text-red-300">
                          −{formatCurrency(payrollSummary.totals.totalAbsentDeduction)}
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-300">
                          −{formatCurrency(payrollSummary.totals.totalLeaveDeduction)}
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-300">
                          +{formatCurrency(payrollSummary.totals.totalBonus)}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-emerald-300 text-base">
                          {formatCurrency(payrollSummary.totals.totalPayable)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-slate-400 text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-600">No summary data</h3>
                <p className="text-slate-400 text-sm mt-1">Set salary structures for employees to see the period summary.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Payment Modal ────────────────────────────────────────────────── */}
        {showPaymentModal && selectedEmployeeForPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-t-2xl border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">💳</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Process Payment</h3>
                    <p className="text-slate-500 text-sm">{selectedEmployeeForPayment.employee.fullName}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Breakdown inline */}
                <SalaryBreakdownCard emp={selectedEmployeeForPayment} formatCurrency={formatCurrency} />

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Payment Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-semibold">₹</span>
                    </div>
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                      className="pl-8 py-3 text-lg font-medium border-2 border-slate-200 rounded-xl focus:border-indigo-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400">Minimum payment: ₹1</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 bg-slate-50 rounded-b-2xl border-t border-slate-200">
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedEmployeeForPayment(null); setCustomAmount('') }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={processIndividualPayment}
                  disabled={paymentProcessing || !customAmount || parseFloat(customAmount) < 1}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  {paymentProcessing
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span>
                    : `💰 Pay ${customAmount ? formatCurrency(parseFloat(customAmount)) : 'Now'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Salary Structure Modal ───────────────────────────────────────── */}
        {showStructureModal && selectedEmployeeForStructure && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedEmployeeForStructure.hasSalaryStructure ? 'Edit' : 'Set'} Salary Structure
                </h3>
                <p className="text-sm text-slate-500 mt-1">{selectedEmployeeForStructure.employee.fullName}</p>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Pay Type
                    <select
                      value={structureForm.salaryType}
                      onChange={e => setStructureForm({ ...structureForm, salaryType: e.target.value as 'monthly' | 'hourly' })}
                      className="mt-1.5 w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 outline-none transition"
                    >
                      <option value="monthly">Monthly Salary</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    {structureForm.salaryType === 'monthly' ? 'Monthly Salary (₹)' : 'Hourly Rate (₹)'}
                    <Input
                      type="number"
                      min="0"
                      value={structureForm.salaryType === 'monthly' ? structureForm.salary : structureForm.hourlyRate}
                      onChange={e => setStructureForm({ ...structureForm, [structureForm.salaryType === 'monthly' ? 'salary' : 'hourlyRate']: Number(e.target.value) })}
                      className="mt-1.5"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Bonus (₹)
                    <Input type="number" min="0" value={structureForm.bonus} onChange={e => setStructureForm({ ...structureForm, bonus: Number(e.target.value) })} className="mt-1.5" />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Fixed Deduction (₹)
                    <Input type="number" min="0" value={structureForm.fixedDeduction} onChange={e => setStructureForm({ ...structureForm, fixedDeduction: Number(e.target.value) })} className="mt-1.5" />
                  </label>

                  {structureForm.salaryType === 'monthly' && <>
                    <label className="block text-sm font-semibold text-slate-700">
                      Leave Deduction / Day (₹)
                      <Input type="number" min="0" value={structureForm.leaveDeductionPerDay} onChange={e => setStructureForm({ ...structureForm, leaveDeductionPerDay: Number(e.target.value) })} className="mt-1.5" />
                      <p className="text-xs text-slate-400 mt-1">Set to 0 to auto-compute from monthly salary ÷ period days</p>
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Half-Day Deduction (₹)
                      <Input type="number" min="0" value={structureForm.halfDayDeductionPerDay} onChange={e => setStructureForm({ ...structureForm, halfDayDeductionPerDay: Number(e.target.value) })} className="mt-1.5" />
                      <p className="text-xs text-slate-400 mt-1">Set to 0 to auto-compute (counts as 0.5 day)</p>
                    </label>
                  </>}
                </div>

                {/* Auto per-day preview */}
                {structureForm.salaryType === 'monthly' && structureForm.salary > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-indigo-800 mb-2">📐 Auto Per-Day Rate Preview</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[28, 30, 31].map(d => (
                        <div key={d} className="bg-white rounded-lg p-2.5 border border-indigo-100">
                          <p className="text-xs text-indigo-400">{d}-day month</p>
                          <p className="font-extrabold text-indigo-700">{formatCurrency(structureForm.salary / d)}/day</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-indigo-500 mt-2">
                      Absent days are automatically deducted at the per-day rate based on actual period days.
                    </p>
                  </div>
                )}

                {/* Attendance hint */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-700 mb-1">Current Attendance — {periodLabel}</p>
                  <div className="flex gap-4 flex-wrap">
                    <span>✅ Present: <strong>{selectedEmployeeForStructure.attendance.presentDays}</strong></span>
                    <span>❌ Absent: <strong className="text-red-600">{selectedEmployeeForStructure.attendance.absentDays}</strong></span>
                    <span>½ Half-day: <strong>{selectedEmployeeForStructure.attendance.halfDays}</strong></span>
                    <span>🌿 Leave: <strong>{selectedEmployeeForStructure.attendance.leaveDays}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setShowStructureModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStructure}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
                >
                  💾 Save Structure
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default NewPayrollDashboard