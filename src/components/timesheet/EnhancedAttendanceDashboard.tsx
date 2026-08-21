'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { timesheetService, Timesheet } from '@/services/timesheetService'
import { employeeService, Employee } from '@/services/employeeService'
import { 
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Check,
  X,
  UserCheck,
  UserX,
  Coffee,
  Plane,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  Bell,
  Menu
} from 'lucide-react'

interface ExtendedEmployee extends Employee {
  position?: string
  joinDate?: string
  phone?: string
  address?: string
}

interface AttendanceFormData {
  status: 'present' | 'absent' | 'leave' | 'half-day'
  checkIn: string
  checkOut: string
  notes: string
  leaveType?: string
}

const EnhancedAttendanceDashboard = () => {
  const [employees, setEmployees] = useState<ExtendedEmployee[]>([])
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [editingTimesheet, setEditingTimesheet] = useState<string | null>(null)
  const [formData, setFormData] = useState<AttendanceFormData>({
    status: 'present',
    checkIn: '09:00',
    checkOut: '18:00',
    notes: '',
    leaveType: ''
  })
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch employees
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Fetch timesheets when date changes
  useEffect(() => {
    fetchDailyTimesheets()
  }, [selectedDate])

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees({ limit: 1000 })
      if (data?.success && data?.data?.employees) {
        // Filter out any null/undefined employees
        const validEmployees = data.data.employees.filter(emp => emp && emp._id && emp.fullName)
        setEmployees(validEmployees || [])
      } else {
        console.warn('Invalid employee data structure:', data)
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      alert('Failed to fetch employees')
      setEmployees([])
    }
  }

  const fetchDailyTimesheets = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const data = await timesheetService.getTimesheets({ date: dateStr })
      if (data?.success && data?.data?.timesheets) {
        // Filter out any null/undefined timesheets
        const validTimesheets = data.data.timesheets.filter((ts: any) => ts && ts._id)
        setTimesheets(validTimesheets || [])
      } else {
        console.warn('Invalid timesheet data structure:', data)
        setTimesheets([])
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      alert('Failed to fetch timesheets')
      setTimesheets([])
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (employeeId: string, status: 'present' | 'absent' | 'leave' | 'half-day', customTimes?: { checkIn: string, checkOut: string, notes?: string }) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const attendanceType = status === 'half-day' ? 'half_day' : status

      const requestData: any = {
        employeeId,
        date: dateStr,
        attendanceType: attendanceType as 'present' | 'absent' | 'leave' | 'half_day'
      }

      // Add custom times if provided, otherwise use default times
      if (status === 'present' || status === 'half-day') {
        const checkInTime = customTimes?.checkIn || formData.checkIn
        const checkOutTime = customTimes?.checkOut || formData.checkOut

        requestData.checkIn = `${dateStr}T${checkInTime}:00.000Z`
        requestData.checkOut = `${dateStr}T${checkOutTime}:00.000Z`
      }

      if (customTimes?.notes || formData.notes) {
        requestData.notes = customTimes?.notes || formData.notes
      }

      if (status === 'leave' && formData.leaveType) {
        requestData.leaveType = formData.leaveType
      }

      await timesheetService.createTimesheet(requestData)
      await fetchDailyTimesheets()

      // Reset form data
      setFormData({
        status: 'present',
        checkIn: '09:00',
        checkOut: '18:00',
        notes: '',
        leaveType: ''
      })
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Failed to mark attendance')
    }
  }

  const resetAttendance = async (timesheetId: string) => {
    if (!confirm('Are you sure you want to reset this attendance record?')) {
      return
    }

    try {
      await timesheetService.deleteTimesheet(timesheetId)
      await fetchDailyTimesheets()
    } catch (error) {
      console.error('Error resetting attendance:', error)
      alert('Failed to reset attendance')
    }
  }

  const updateAttendance = async (timesheetId: string) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const attendanceType = formData.status === 'half-day' ? 'half_day' : formData.status

      const updateData: any = {
        attendanceType: attendanceType as 'present' | 'absent' | 'leave' | 'half_day'
      }

      if (formData.status === 'present' || formData.status === 'half-day') {
        updateData.checkIn = `${dateStr}T${formData.checkIn}:00.000Z`
        updateData.checkOut = `${dateStr}T${formData.checkOut}:00.000Z`
      }

      if (formData.notes) {
        updateData.notes = formData.notes
      }

      if (formData.status === 'leave' && formData.leaveType) {
        updateData.leaveType = formData.leaveType
      }

      await timesheetService.updateTimesheet(timesheetId, updateData)
      await fetchDailyTimesheets()
      setEditingTimesheet(null)
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('Failed to update attendance')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Present', icon: <UserCheck className="w-4 h-4" /> },
      absent: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Absent', icon: <UserX className="w-4 h-4" /> },
      leave: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'On Leave', icon: <Plane className="w-4 h-4" /> },
      'half-day': { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Half Day', icon: <Coffee className="w-4 h-4" /> },
      'half_day': { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Half Day', icon: <Coffee className="w-4 h-4" /> }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.text}
      </div>
    )
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee?.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const getTimesheetForEmployee = (employeeId: string) => {
    return timesheets.find(ts => ts?.employee?._id === employeeId)
  }

  const departments = [...new Set(employees.map(emp => emp?.department).filter(Boolean))]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startEdit = (timesheet: Timesheet) => {
    if (!timesheet?._id) return;

    setEditingTimesheet(timesheet._id)
    setFormData({
      status: timesheet.attendanceType || timesheet.status || 'present',
      checkIn: timesheet.checkIn ? new Date(timesheet.checkIn).toTimeString().slice(0, 5) : '09:00',
      checkOut: timesheet.checkOut ? new Date(timesheet.checkOut).toTimeString().slice(0, 5) : '18:00',
      notes: timesheet.notes || '',
      leaveType: ''
    })
  }

  const cancelEdit = () => {
    setEditingTimesheet(null)
    setFormData({
      status: 'present',
      checkIn: '09:00',
      checkOut: '18:00',
      notes: '',
      leaveType: ''
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Calculate attendance stats
  const attendanceStats = {
    total: filteredEmployees.length,
    present: timesheets.filter(ts => ts.attendanceType === 'present').length,
    absent: timesheets.filter(ts => ts.attendanceType === 'absent').length,
    onLeave: timesheets.filter(ts => ts.attendanceType === 'leave').length,
    halfDay: timesheets.filter(ts => ts.attendanceType === 'half-day').length
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Enhanced Attendance Dashboard</h1>
                  <p className="text-sm text-slate-500">{formatDate(selectedDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">AD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Employees</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{attendanceStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Present</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{attendanceStats.present}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{attendanceStats.absent}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Leave</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{attendanceStats.onLeave}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Date Selector */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>

              <Button
                onClick={fetchDailyTimesheets}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => {
                      setDepartmentFilter('')
                      setSearchTerm('')
                    }}
                    className="px-4 py-2.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button className="px-4 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Default Time Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Default Time Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Time</label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Time</label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type (For Leave)</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select leave type</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="vacation">Vacation</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Employee Attendance</h2>
              <p className="text-sm text-slate-600 mt-1">{filteredEmployees.length} employees found</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Upload className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-slate-600">Loading attendance data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmployees.map(employee => {
                  if (!employee?._id) return null;

                  const timesheet = getTimesheetForEmployee(employee._id)
                  const isExpanded = expandedEmployee === employee._id
                  const isEditing = editingTimesheet === timesheet?._id

                  return (
                    <div key={employee._id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      {/* Main Employee Row */}
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {getInitials(employee?.fullName || 'U')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{employee?.fullName || 'Unknown'}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>ID: {employee?.employeeId || 'N/A'}</span>
                              <span>•</span>
                              <span>{employee?.department || 'N/A'}</span>
                              {employee?.position && (
                                <>
                                  <span>•</span>
                                  <span>{employee.position}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedEmployee(isExpanded ? null : employee._id)}
                            className="flex items-center gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
                          >
                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>

                          {timesheet ? (
                            <div className="flex items-center gap-3">
                              {getStatusBadge(timesheet.attendanceType || timesheet.status)}
                              {timesheet.checkIn && (
                                <div className="text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-500">In:</span>
                                    <span className="font-medium">{formatTime(timesheet.checkIn)}</span>
                                  </div>
                                  {timesheet.checkOut && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-xs text-slate-500">Out:</span>
                                      <span className="font-medium">{formatTime(timesheet.checkOut)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(timesheet)}
                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resetAttendance(timesheet._id)}
                                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Reset
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => markAttendance(employee._id, 'present')}
                              >
                                <UserCheck className="w-4 h-4" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => markAttendance(employee._id, 'absent')}
                              >
                                <UserX className="w-4 h-4" />
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => markAttendance(employee._id, 'leave')}
                              >
                                <Plane className="w-4 h-4" />
                                Leave
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => markAttendance(employee._id, 'half-day')}
                              >
                                <Coffee className="w-4 h-4" />
                                Half Day
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Employee Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                <span>📧</span>
                                Contact Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-16 text-slate-500">Email:</span>
                                  <span>{employee?.email || 'N/A'}</span>
                                </div>
                                {employee?.phone && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-16 text-slate-500">Phone:</span>
                                    <span>{employee.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                <span>🏢</span>
                                Work Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-20 text-slate-500">Department:</span>
                                  <span>{employee?.department || 'N/A'}</span>
                                </div>
                                {employee?.position && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-20 text-slate-500">Position:</span>
                                    <span>{employee.position}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-20 text-slate-500">Status:</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    employee?.isActive 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {employee?.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                {employee?.joinDate && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-20 text-slate-500">Joined:</span>
                                    <span>{new Date(employee.joinDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {timesheet && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                  <span>📅</span>
                                  Today's Attendance
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-16 text-slate-500">Status:</span>
                                    <span>{timesheet?.attendanceType || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-16 text-slate-500">Hours:</span>
                                    <span className="font-medium">{timesheet?.hoursWorked || 0} hrs</span>
                                  </div>
                                  {timesheet?.notes && (
                                    <div className="flex items-start gap-2 text-slate-600">
                                      <span className="w-16 text-slate-500">Notes:</span>
                                      <span className="flex-1">{timesheet.notes}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-16 text-slate-500">Approval:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                      timesheet?.approvalStatus === 'approved' 
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : timesheet?.approvalStatus === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {timesheet?.approvalStatus || 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Edit Form */}
                      {isEditing && timesheet && (
                        <div className="border-t border-slate-200 bg-amber-50 p-6">
                          <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                            <Edit3 className="w-5 h-5" />
                            Edit Attendance
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                              <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="leave">Leave</option>
                                <option value="half-day">Half Day</option>
                              </select>
                            </div>

                            {(formData.status === 'present' || formData.status === 'half-day') && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-in</label>
                                  <input
                                    type="time"
                                    value={formData.checkIn}
                                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-out</label>
                                  <input
                                    type="time"
                                    value={formData.checkOut}
                                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                              <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateAttendance(timesheet._id)}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredEmployees.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No employees found</h3>
                    <p className="text-slate-600">Try adjusting your search criteria or filters.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAttendanceDashboard