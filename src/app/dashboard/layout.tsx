import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { NavigationBot } from "@/components/dashboard/navigation-bot"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex h-screen flex-col lg:flex-row">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
            <NavigationBot/>
        </div>
    )
}
