'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { complaintService, type Complaint, type ComplaintStats } from '@/services/complaintService'
import { 
  MessageCircle, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Badge,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import DashboardShell from '@/components/layout/DashboardShell'

const statusColors = {
  open: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-red-100',
  'in-progress': 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 shadow-yellow-100',
  resolved: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 shadow-green-100',
  closed: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-gray-100'
}

const priorityColors = {
  low: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-blue-100',
  medium: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 shadow-yellow-100',
  high: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 shadow-orange-100',
  urgent: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 shadow-red-100'
}

const urgentPulse = 'animate-pulse ring-2 ring-red-300'

export default function ComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
    limit: 20
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    loadComplaints()
    loadStats()
  }, [filters])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const response = await complaintService.getComplaints(filters)
      if (response.success) {
        setComplaints(response.data.complaints)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      console.log('Loading complaint stats...')
      const response = await complaintService.getComplaintStats()
      console.log('Stats response:', response)
      if (response.success) {
        console.log('Setting stats:', response.data)
        setStats(response.data)
      } else {
        console.error('Stats request failed:', response.message)
      }
    } catch (error) {
      console.error('Error loading complaint stats:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const openComplaintDetail = async (complaint: Complaint) => {
    try {
      const response = await complaintService.getComplaintById(complaint._id)
      if (response.success) {
        setSelectedComplaint(response.data)
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      console.error('Error loading complaint details:', error)
    }
  }

  const updateComplaintStatus = async (complaintId: string, status: string, resolution?: string, note?: string) => {
    try {
      const response = await complaintService.updateComplaint(complaintId, {
        status,
        resolution,
        internalNote: note
      })
      
      if (response.success) {
        loadComplaints() // Refresh the list
        if (selectedComplaint && selectedComplaint._id === complaintId) {
          // Refresh the selected complaint details
          const detailResponse = await complaintService.getComplaintById(complaintId)
          if (detailResponse.success) {
            setSelectedComplaint(detailResponse.data)
          }
        }
        loadStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ]

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'billing', label: 'Billing' },
    { value: 'service', label: 'Service' },
    { value: 'technical', label: 'Technical' },
    { value: 'product', label: 'Product' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <DashboardShell>
    <div className="space-y-8 animate-fadeIn">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10 animate-float"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5 animate-float-delayed"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Complaints Center</h1>
            <p className="text-blue-100 text-lg">Streamline customer complaint management</p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-black text-sm font-medium">Resolution Rate: 94%</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <MessageCircle className="h-24 w-24 text-white opacity-30" />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards with Animations */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-blue-900 animate-slideUp">{stats.total}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">+12% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className={`p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-red-200 ${stats.open > 10 ? urgentPulse : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Open</p>
                  <p className="text-3xl font-bold text-red-900 animate-slideUp">{stats.open}</p>
                  <div className="flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-600 font-medium">Needs attention</span>
                  </div>
                </div>
                <div className="p-3 bg-red-500 rounded-full shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-900 animate-slideUp">{stats.inProgress}</p>
                  <div className="flex items-center mt-1">
                    <RefreshCw className="h-3 w-3 text-yellow-500 mr-1 animate-spin" />
                    <span className="text-xs text-yellow-600 font-medium">Being resolved</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Resolved</p>
                  <p className="text-3xl font-bold text-green-900 animate-slideUp">{stats.resolved}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">Great job!</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500 rounded-full shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Closed</p>
                  <p className="text-3xl font-bold text-gray-900 animate-slideUp">{stats.closed}</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-500 rounded-full shadow-lg">
                  <Badge className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className={`p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-red-200 ${stats.urgent > 5 ? urgentPulse : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Urgent</p>
                  <p className="text-3xl font-bold text-red-900 animate-slideUp">{stats.urgent}</p>
                  <div className="flex items-center mt-1">
                    <Zap className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-600 font-medium">Critical</span>
                  </div>
                </div>
                <div className="p-3 bg-red-500 rounded-full shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">High Priority</p>
                  <p className="text-3xl font-bold text-orange-900 animate-slideUp">{stats.high}</p>
                  <div className="flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600 font-medium">Important</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Enhanced Filters with Modern Design */}
      <Card className="p-6 bg-gradient-to-r from-white to-gray-50 border-0 shadow-xl">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={statusOptions}
            placeholder="Filter by status"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          />
          
          <Select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            options={priorityOptions}
            placeholder="Filter by priority"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          />
          
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={categoryOptions}
            placeholder="Filter by category"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          />
          
          <Button
            onClick={() => setFilters({ search: '', status: '', priority: '', category: '', page: 1, limit: 20 })}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 transform transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Enhanced Complaints List */}
      <Card className="overflow-hidden bg-white shadow-2xl border-0">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 text-lg">Loading complaints...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the data</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">No complaints found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {complaints.map((complaint, index) => (
                    <tr key={complaint._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group animate-slideInUp" style={{animationDelay: `${index * 50}ms`}}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{complaint.clientName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {complaint.clientEmail}
                            </div>
                            {complaint.invoiceNumber && (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                                Invoice: {complaint.invoiceNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate group-hover:text-blue-700 transition-colors" title={complaint.subject}>
                          {complaint.subject}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${priorityColors[complaint.priority]} ${complaint.priority === 'urgent' ? 'animate-pulse' : ''}`}>
                          {complaint.priority === 'urgent' && <Zap className="h-3 w-3 mr-1" />}
                          {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize bg-gray-50 px-3 py-1 rounded-full">
                          {complaint.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${statusColors[complaint.status]}`}>
                          {complaint.status === 'in-progress' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {complaint.status.replace('-', ' ').charAt(0).toUpperCase() + complaint.status.replace('-', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                        {complaint.ageInDays && complaint.ageInDays > 7 && (
                          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full mt-1 inline-flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {complaint.ageInDays} days old
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => openComplaintDetail(complaint)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 text-sm shadow-lg transform transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 shadow-lg disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 shadow-lg disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">
                        Showing page <span className="font-bold text-blue-600">{pagination.currentPage}</span> of{' '}
                        <span className="font-bold text-blue-600">{pagination.totalPages}</span>
                        {' '}({pagination.totalCount} total complaints)
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm space-x-2">
                        <Button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 shadow-lg disabled:opacity-50 transform transition-all duration-200 hover:scale-105"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNext}
                          className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 shadow-lg disabled:opacity-50 transform transition-all duration-200 hover:scale-105"
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Enhanced Complaint Detail Modal */}
      {isDetailModalOpen && selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={updateComplaintStatus}
        />
      )}
    </div>
    </DashboardShell>
  )
}

// Enhanced Complaint Detail Modal Component
function ComplaintDetailModal({ 
  complaint, 
  onClose, 
  onUpdate 
}: { 
  complaint: Complaint, 
  onClose: () => void,
  onUpdate: (id: string, status: string, resolution?: string, note?: string) => void
}) {
  const [newStatus, setNewStatus] = useState<'open' | 'in-progress' | 'resolved' | 'closed'>(complaint.status)
  const [resolution, setResolution] = useState(complaint.resolution || '')
  const [internalNote, setInternalNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(complaint._id, newStatus, resolution, internalNote)
      onClose()
    } catch (error) {
      console.error('Error updating complaint:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm animate-fadeIn">
      <div className="relative top-8 mx-auto p-0 border-0 w-11/12 max-w-5xl shadow-2xl rounded-2xl bg-white animate-slideInUp">
        {/* Enhanced Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Complaint Details</h3>
              <p className="text-blue-100">Comprehensive view and management</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Client & Complaint Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Name</p>
                        <p className="text-sm font-semibold text-gray-900">{complaint.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <Mail className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{complaint.clientEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {complaint.clientPhone && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Phone className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{complaint.clientPhone}</p>
                        </div>
                      </div>
                    )}
                    {complaint.invoiceNumber && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Invoice</p>
                          <p className="text-sm font-semibold text-blue-600">{complaint.invoiceNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Complaint Details Card */}
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gray-600 rounded-lg shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Complaint Details
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Subject</p>
                    <p className="text-lg font-semibold text-gray-900">{complaint.subject}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-2">Description</p>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-800 leading-relaxed">{complaint.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-2">Priority</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${priorityColors[complaint.priority]}`}>
                        {complaint.priority === 'urgent' && <Zap className="h-4 w-4 mr-1" />}
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </span>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-2">Category</p>
                      <span className="inline-flex px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-800 rounded-full capitalize">
                        {complaint.category}
                      </span>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-2">Created</p>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
                        <Calendar className="h-4 w-4" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Status & Actions */}
            <div className="space-y-6">
              {/* Status Update Card */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-500 rounded-lg shadow-md">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  Update Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as 'open' | 'in-progress' | 'resolved' | 'closed')}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                    >
                      <option value="open">🔴 Open</option>
                      <option value="in-progress">🟡 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="closed">⚫ Closed</option>
                    </select>
                  </div>
                  
                  {(newStatus === 'resolved' || newStatus === 'closed') && (
                    <div className="animate-slideInUp">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Details</label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                        rows={4}
                        placeholder="Describe how this complaint was resolved..."
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Internal Note</label>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                      rows={3}
                      placeholder="Add an internal note (optional)..."
                    />
                  </div>
                  
                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Update Complaint
                      </div>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Internal Notes History */}
              {complaint.internalNotes && complaint.internalNotes.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Internal Notes History
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {complaint.internalNotes.map((note, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-400 animate-slideInUp" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="text-sm text-gray-800 mb-2 leading-relaxed">{note.note}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{note.addedBy.fullName}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(note.addedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}