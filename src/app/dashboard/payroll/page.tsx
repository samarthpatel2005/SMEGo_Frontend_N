import DashboardShell from '@/components/layout/DashboardShell'
import NewPayrollDashboard from '@/components/payroll/NewPayrollDashboard'

export default function PayrollPage() {
  return (
    <DashboardShell>
      <NewPayrollDashboard />
    </DashboardShell>
  )
}
