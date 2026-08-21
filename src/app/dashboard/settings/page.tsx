import DashboardShell from '@/components/layout/DashboardShell'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Organization Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none">Organization Name</label>
                <input 
                  type="text" 
                  defaultValue="SME Operations Inc" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none">Business Address</label>
                <textarea 
                  defaultValue="123 Business St, Suite 100&#10;New York, NY 10001"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none">Tax ID</label>
                <input 
                  type="text" 
                  defaultValue="12-3456789" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications" className="text-sm font-medium">
                  Email notifications for new invoices
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="payroll-notifications" defaultChecked />
                <label htmlFor="payroll-notifications" className="text-sm font-medium">
                  Payroll processing notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="client-notifications" />
                <label htmlFor="client-notifications" className="text-sm font-medium">
                  New client registration alerts
                </label>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Security</h3>
            <div className="space-y-4">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Enable Two-Factor Authentication</Button>
              <Button variant="outline">Download Account Data</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
