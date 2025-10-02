import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardMain } from "@/components/dashboard/dashboard-main"
import { CredentialsPanel } from "@/components/dashboard/credentials-panel"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 flex overflow-hidden">
            {/* Working Section */}
            <main className="flex-1 overflow-y-auto p-6">
              <DashboardMain />
            </main>

            {/* Credentials Panel */}
            <aside className="w-80 border-l border-border overflow-y-auto">
              <CredentialsPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
