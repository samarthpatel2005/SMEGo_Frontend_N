import DashboardShell from '@/components/layout/DashboardShell'
import Button from '@/components/ui/Button'

export default function AdminPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Super admin controls and system management.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">User Management</h3>
            <div className="space-y-4">
              <Button className="w-full">Manage Users</Button>
              <Button variant="outline" className="w-full">User Permissions</Button>
              <Button variant="outline" className="w-full">Role Management</Button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">System Settings</h3>
            <div className="space-y-4">
              <Button className="w-full">Global Settings</Button>
              <Button variant="outline" className="w-full">Feature Flags</Button>
              <Button variant="outline" className="w-full">System Logs</Button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Organization Management</h3>
            <div className="space-y-4">
              <Button className="w-full">All Organizations</Button>
              <Button variant="outline" className="w-full">Subscription Plans</Button>
              <Button variant="outline" className="w-full">Billing Management</Button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Analytics & Reports</h3>
            <div className="space-y-4">
              <Button className="w-full">System Analytics</Button>
              <Button variant="outline" className="w-full">Usage Reports</Button>
              <Button variant="outline" className="w-full">Revenue Dashboard</Button>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">System Statistics</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">89</div>
              <p className="text-sm text-muted-foreground">Organizations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">15,678</div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$2.4M</div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
