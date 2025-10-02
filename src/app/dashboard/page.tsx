import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardMain } from "@/components/dashboard/dashboard-main"
import { CredentialsPanel } from "@/components/dashboard/credentials-panel"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* sidebar is hidden on mobile  */}
        <DashboardSidebar />

        {/* main content area  */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* working section  */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <DashboardMain />
            </main>

            {/* credentials panel, hidden on mobile  */}
            <aside className="hidden xl:block xl:w-80 border-l border-border overflow-y-auto">
              <CredentialsPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
