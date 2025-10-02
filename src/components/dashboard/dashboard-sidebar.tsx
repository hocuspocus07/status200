"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Home, Award, BookOpen, Users, Settings, BarChart3, FileText, ChevronLeft, ChevronRight } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
  { name: "My Credentials", href: "/dashboard/credentials", icon: Award, count: 12 },
  { name: "Learning Paths", href: "/dashboard/learning", icon: BookOpen, count: 3 },
  { name: "Verification", href: "/dashboard/verification", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Award className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">CredentialHub</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.current
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1">{item.name}</span>
                  {item.count && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">john@example.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
