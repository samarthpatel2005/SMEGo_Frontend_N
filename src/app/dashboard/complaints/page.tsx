'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { complaintService, type Complaint, type ComplaintStats } from '@/services/complaintService'
import {
  MessageCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Tag,
  Circle,
  BarChart2,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import DashboardShell from '@/components/layout/DashboardShell'

// ─── Type helpers ─────────────────────────────────────────────────────────────
type Status = 'open' | 'in-progress' | 'resolved' | 'closed'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

// ─── Config maps ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<Status, { label: string; dot: string; badge: string; icon: React.ReactNode }> = {
  open:        { label: 'Open',        dot: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700 border-rose-200',    icon: <Circle className="w-3 h-3" /> },
  'in-progress':{ label: 'In Progress', dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  resolved:    { label: 'Resolved',    dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  closed:      { label: 'Closed',      dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200',  icon: <ShieldCheck className="w-3 h-3" /> },
}

const PRIORITY_CFG: Record<Priority, { label: string; badge: string; dot: string }> = {
  urgent: { label: 'Urgent', badge: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-500' },
  high:   { label: 'High',   badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  medium: { label: 'Medium', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  low:    { label: 'Low',    badge: 'bg-sky-100 text-sky-700 border-sky-200',      dot: 'bg-sky-400' },
}

// ─── Small atoms ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.open
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.badge}`}>
      {c.icon} {c.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_CFG[priority] ?? PRIORITY_CFG.low
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.badge} ${priority === 'urgent' ? 'animate-pulse' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
      {initials}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, colorClass, pulse }: {
  icon: React.ReactNode; label: string; value: number; sub: string
  colorClass: string; pulse?: boolean
}) {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group p-5 ${pulse ? 'ring-2 ring-red-200 ring-offset-1 animate-pulse' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-3xl font-extrabold ${colorClass} group-hover:scale-105 transition-transform origin-left`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')} transition-all group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
        active ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false })
  const searchRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const loadComplaints = async (params: { search?: string; status?: string; priority?: string; category?: string; page?: number } = {}) => {
    setLoading(true)
    try {
      const res = await complaintService.getComplaints({ search, status: statusFilter, priority: priorityFilter, category: categoryFilter, page, limit: 15, ...params })
      if (res.success) {
        setComplaints(res.data.complaints)
        setPagination(res.data.pagination)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadStats = async () => {
    try {
      const res = await complaintService.getComplaintStats()
      if (res.success) setStats(res.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadComplaints(); loadStats() }, [statusFilter, priorityFilter, categoryFilter, page])

  // Debounce search
  useEffect(() => {
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setPage(1); loadComplaints({ search, page: 1 }) }, 400)
    return () => clearTimeout(searchRef.current)
  }, [search])

  const openDetail = async (c: Complaint) => {
    try {
      const res = await complaintService.getComplaintById(c._id)
      if (res.success) setSelectedComplaint(res.data)
    } catch (e) { console.error(e) }
  }

  const onUpdate = async (id: string, status: string, resolution?: string, note?: string) => {
    try {
      const res = await complaintService.updateComplaint(id, { status, resolution, internalNote: note })
      if (res.success) {
        loadComplaints()
        loadStats()
        if (selectedComplaint?._id === id) {
          const dr = await complaintService.getComplaintById(id)
          if (dr.success) setSelectedComplaint(dr.data)
        }
      }
    } catch (e) { console.error(e) }
  }

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); setPage(1) }
  const hasFilters = search || statusFilter || priorityFilter || categoryFilter

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

          {/* ── Hero Header ──────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 p-8 shadow-2xl">
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-8 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-black/10" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center shadow-inner">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-violet-200 text-sm font-semibold tracking-widest uppercase">Support Hub</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Complaints <span className="text-violet-300">Center</span>
                </h1>
                <p className="text-violet-200 mt-2 text-base">Track, manage and resolve customer complaints with speed.</p>
              </div>

              {/* Live stats strip */}
              {stats && (
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Open', value: stats.open, color: 'bg-rose-500/80' },
                    { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-400/80' },
                    { label: 'Resolved', value: stats.resolved, color: 'bg-emerald-500/80' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex flex-col items-center border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${s.color} mb-1`} />
                      <span className="text-2xl font-extrabold text-white">{s.value}</span>
                      <span className="text-xs text-violet-200 font-medium">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolution rate bar */}
            {stats && (
              <div className="relative mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-violet-200 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Resolution Rate
                  </span>
                  <span className="text-sm font-bold text-white">
                    {stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                    style={{ width: stats.total > 0 ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── KPI Cards ────────────────────────────────────────────────── */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
              <KpiCard icon={<BarChart2 className="w-5 h-5 text-violet-600" />} label="Total" value={stats.total} sub="all time" colorClass="text-violet-700" />
              <KpiCard icon={<Inbox className="w-5 h-5 text-rose-600" />} label="Open" value={stats.open} sub="needs action" colorClass="text-rose-600" pulse={stats.open > 10} />
              <KpiCard icon={<Clock className="w-5 h-5 text-amber-600" />} label="In Progress" value={stats.inProgress} sub="being resolved" colorClass="text-amber-600" />
              <KpiCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} label="Resolved" value={stats.resolved} sub="completed" colorClass="text-emerald-600" />
              <KpiCard icon={<ShieldCheck className="w-5 h-5 text-slate-500" />} label="Closed" value={stats.closed} sub="archived" colorClass="text-slate-500" />
              <KpiCard icon={<Zap className="w-5 h-5 text-red-600" />} label="Urgent" value={stats.urgent} sub="critical" colorClass="text-red-600" pulse={stats.urgent > 5} />
              <KpiCard icon={<AlertCircle className="w-5 h-5 text-orange-600" />} label="High" value={stats.high} sub="important" colorClass="text-orange-600" />
            </div>
          )}

          {/* ── Filter Bar ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by client name, email or subject…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-slate-50 placeholder-slate-400 transition"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1"><Filter className="w-3 h-3" />Status:</span>
                {['', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
                  <FilterPill key={s} label={s === '' ? 'All' : STATUS_CFG[s as Status]?.label ?? s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1) }} />
                ))}
              </div>

              {/* Priority pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1"><Tag className="w-3 h-3" />Priority:</span>
                {['', 'urgent', 'high', 'medium', 'low'].map(p => (
                  <FilterPill key={p} label={p === '' ? 'All' : PRIORITY_CFG[p as Priority]?.label ?? p} active={priorityFilter === p} onClick={() => { setPriorityFilter(p); setPage(1) }} />
                ))}
              </div>

              {/* Clear */}
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all bg-white">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Complaints Table ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table head */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Client</span>
              <span>Subject</span>
              <span>Priority</span>
              <span>Category</span>
              <span>Status</span>
              <span>Date</span>
              <span></span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Loading complaints…</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-semibold">No complaints found</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query</p>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm text-violet-600 font-semibold hover:underline">Clear all filters</button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {complaints.map((complaint) => {
                  const status = complaint.status as Status
                  const priority = complaint.priority as Priority
                  const sc = STATUS_CFG[status] ?? STATUS_CFG.open
                  const age = complaint.ageInDays ?? 0
                  return (
                    <div
                      key={complaint._id}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-6 py-4 items-center hover:bg-violet-50/40 transition-all duration-150 group cursor-pointer"
                      onClick={() => openDetail(complaint)}
                    >
                      {/* Client */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={complaint.clientName} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{complaint.clientName}</p>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" />{complaint.clientEmail}</p>
                          {complaint.invoiceNumber && (
                            <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-violet-100">{complaint.invoiceNumber}</span>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <p className="text-sm text-slate-700 font-medium truncate pr-2 group-hover:text-violet-700 transition-colors" title={complaint.subject}>
                        {complaint.subject}
                      </p>

                      {/* Priority */}
                      <PriorityBadge priority={priority} />

                      {/* Category */}
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full capitalize">{complaint.category}</span>

                      {/* Status */}
                      <StatusBadge status={status} />

                      {/* Date */}
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        {age > 7 && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> {age}d old
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={e => { e.stopPropagation(); openDetail(complaint) }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-200 opacity-0 group-hover:opacity-100 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                <p className="text-sm text-slate-500">
                  Page <span className="font-bold text-slate-700">{pagination.currentPage}</span> of <span className="font-bold text-slate-700">{pagination.totalPages}</span>
                  <span className="ml-2 text-slate-400">({pagination.totalCount} complaints)</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!pagination.hasPrev}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl border text-sm font-semibold transition-all ${page === p ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNext}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Drawer Modal ───────────────────────────────────────────── */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={onUpdate}
        />
      )}
    </DashboardShell>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ComplaintDetailModal({
  complaint,
  onClose,
  onUpdate,
}: {
  complaint: Complaint
  onClose: () => void
  onUpdate: (id: string, status: string, resolution?: string, note?: string) => void
}) {
  const [newStatus, setNewStatus] = useState<Status>(complaint.status as Status)
  const [resolution, setResolution] = useState(complaint.resolution || '')
  const [internalNote, setInternalNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [tab, setTab] = useState<'details' | 'notes'>('details')
  const priority = complaint.priority as Priority
  const pc = PRIORITY_CFG[priority] ?? PRIORITY_CFG.low
  const sc = STATUS_CFG[newStatus] ?? STATUS_CFG.open

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(complaint._id, newStatus, resolution, internalNote)
      onClose()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — slides in from right */}
      <div className="relative ml-auto mr-0 min-h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-7 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest">Complaint #{complaint._id.slice(-6).toUpperCase()}</p>
                <h2 className="text-white font-bold text-lg leading-snug max-w-sm truncate">{complaint.subject}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick badges */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} /> {pc.label} Priority
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20 capitalize">
              <Tag className="w-3 h-3" /> {complaint.category}
            </span>
            {complaint.ageInDays && complaint.ageInDays > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
                <Clock className="w-3 h-3" /> {complaint.ageInDays} days old
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {['details', 'notes'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-all border-b-2 ${tab === t ? 'border-violet-600 text-violet-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t === 'details' ? '📋 Details' : `💬 Notes ${complaint.internalNotes?.length ? `(${complaint.internalNotes.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'details' ? (
            <>
              {/* Client card */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-bold text-slate-700">Client Information</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<User className="w-4 h-4 text-violet-500" />} label="Name" value={complaint.clientName} />
                  <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email" value={complaint.clientEmail} />
                  {complaint.clientPhone && <InfoRow icon={<Phone className="w-4 h-4 text-green-500" />} label="Phone" value={complaint.clientPhone} />}
                  {complaint.invoiceNumber && <InfoRow icon={<FileText className="w-4 h-4 text-orange-500" />} label="Invoice" value={complaint.invoiceNumber} highlight />}
                </div>
              </div>

              {/* Complaint body */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">Complaint Details</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                    <p className="text-base font-semibold text-slate-800">{complaint.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                    <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-violet-400 text-sm text-slate-700 leading-relaxed">
                      {complaint.description}
                    </div>
                  </div>
                  {complaint.resolution && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resolution</p>
                      <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-400 text-sm text-emerald-800 leading-relaxed">
                        {complaint.resolution}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-700">Update Status</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Status selector styled as pill group */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['open', 'in-progress', 'resolved', 'closed'] as Status[]).map(s => {
                        const c = STATUS_CFG[s]
                        return (
                          <button
                            key={s}
                            onClick={() => setNewStatus(s)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${newStatus === s ? `${c.badge} border-current ring-2 ring-offset-1 ring-current/30 shadow-sm` : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                            {c.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {(newStatus === 'resolved' || newStatus === 'closed') && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resolution Details <span className="text-rose-400">*</span></p>
                      <textarea
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        rows={3}
                        placeholder="Describe how this complaint was resolved…"
                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none bg-slate-50 placeholder-slate-400"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Note <span className="text-slate-300">(optional)</span></p>
                    <textarea
                      value={internalNote}
                      onChange={e => setInternalNote(e.target.value)}
                      rows={2}
                      placeholder="Add a private note visible only to your team…"
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none bg-slate-50 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Notes tab */
            <div className="space-y-3">
              {complaint.internalNotes && complaint.internalNotes.length > 0 ? (
                complaint.internalNotes.map((note, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Avatar name={note.addedBy?.fullName ?? 'Team'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-slate-800">{note.addedBy?.fullName ?? 'Team'}</p>
                          <p className="text-xs text-slate-400 whitespace-nowrap">{new Date(note.addedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border-l-4 border-violet-300">{note.note}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No internal notes yet</p>
                  <p className="text-slate-400 text-sm mt-1">Switch to Details to add the first note.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-[2] py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── InfoRow helper ───────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold truncate ${highlight ? 'text-violet-600' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  )
}