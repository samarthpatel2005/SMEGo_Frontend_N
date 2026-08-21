import DashboardShell from '@/components/layout/DashboardShell'
import EnhancedAttendanceDashboard from '@/components/timesheet/EnhancedAttendanceDashboard'

export default function AttendancePage() {
  return (
    <DashboardShell>
      <EnhancedAttendanceDashboard />
    </DashboardShell>
  )
}
