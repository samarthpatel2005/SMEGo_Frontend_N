'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { timesheetService, Timesheet } from '@/services/timesheetService'
import { employeeService, Employee } from '@/services/employeeService'

const TimesheetDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Fetch employees
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Fetch timesheets when date or view changes
  useEffect(() => {
    if (view === 'daily') {
      fetchDailyTimesheets()
    } else {
      fetchMonthlyTimesheets()
    }
  }, [selectedDate, view])

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees({ limit: 1000 })
      if (data.success) {
        setEmployees(data.data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      alert('Failed to fetch employees')
    }
  }

  const fetchDailyTimesheets = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const data = await timesheetService.getTimesheets({ date: dateStr })
      if (data.success) {
        setTimesheets(data.data.timesheets || [])
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      alert('Failed to fetch timesheets')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyTimesheets = async () => {
    setLoading(true)
    try {
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1
      const data = await timesheetService.getTimesheets({ year, month })
      if (data.success) {
        setTimesheets(data.data.timesheets || [])
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      alert('Failed to fetch timesheets')
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (employeeId: string, status: 'present' | 'absent' | 'leave' | 'half-day') => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const attendanceType = status === 'half-day' ? 'half_day' : status

      const requestData: any = {
        employeeId: employeeId,
        date: dateStr,
        attendanceType: attendanceType as 'present' | 'absent' | 'leave' | 'half_day'
      }

      // Add check-in time for present attendance
      if (status === 'present') {
        requestData.checkIn = new Date().toISOString()
        // Set check-out time to 8 hours later for demo purposes
        const checkOut = new Date()
        checkOut.setHours(checkOut.getHours() + 8)
        requestData.checkOut = checkOut.toISOString()
      }

      const data = await timesheetService.createTimesheet(requestData)

      if (data.success) {
        alert('Attendance marked successfully')
        fetchDailyTimesheets()
      } else {
        alert(data.message || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Failed to mark attendance')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800', text: '✓ Present' },
      absent: { color: 'bg-red-100 text-red-800', text: '✗ Absent' },
      leave: { color: 'bg-blue-100 text-blue-800', text: '🏖️ Leave' },
      'half-day': { color: 'bg-yellow-100 text-yellow-800', text: '⏰ Half Day' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.text || status}
      </span>
    )
  }

  const filteredEmployees = employees.filter(employee => {
    if (!employee || !employee.fullName || !employee.employeeId) return false

    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const getTimesheetForEmployee = (employeeId: string) => {
    return timesheets.find(ts => ts.employee && ts.employee._id === employeeId)
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'daily' ? 'default' : 'outline'}
            onClick={() => setView('daily')}
          >
            Daily View
          </Button>
          <Button
            variant={view === 'monthly' ? 'default' : 'outline'}
            onClick={() => setView('monthly')}
          >
            Monthly View
          </Button>
        </div>
      </div>

      {/* Date Display */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {view === 'daily' ? formatDate(selectedDate) : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border rounded px-3 py-1"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border rounded px-3 py-2 bg-white min-w-40"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <Button variant="outline">
            📥 Export
          </Button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            👥 {view === 'daily' ? 'Daily Attendance' : 'Monthly Attendance Summary'}
          </h3>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map(employee => {
                const timesheet = getTimesheetForEmployee(employee._id)

                return (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {employee.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{employee.fullName}</h3>
                        <p className="text-sm text-gray-500">
                          {employee.employeeId} • {employee.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {timesheet ? (
                        <>
                          {getStatusBadge(timesheet.status)}
                          {timesheet.checkIn && (
                            <span className="text-sm text-gray-600">
                              In: {new Date(timesheet.checkIn).toLocaleTimeString()}
                            </span>
                          )}
                          {timesheet.checkOut && (
                            <span className="text-sm text-gray-600">
                              Out: {new Date(timesheet.checkOut).toLocaleTimeString()}
                            </span>
                          )}
                        </>
                      ) : view === 'daily' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => markAttendance(employee._id, 'present')}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => markAttendance(employee._id, 'absent')}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => markAttendance(employee._id, 'leave')}
                          >
                            Leave
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            onClick={() => markAttendance(employee._id, 'half-day')}
                          >
                            Half Day
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimesheetDashboard
