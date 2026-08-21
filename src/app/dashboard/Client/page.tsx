import DashboardShell from '@/components/layout/DashboardShell'
import ClientDashboard from '@/components/clients/ClientDashboard'

export default function ClientsPage() {
  return (
    <DashboardShell>
      <ClientDashboard />
    </DashboardShell>
  )
}
