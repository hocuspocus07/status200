"use client"

import { useState,useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Home,
  Award,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
} from "lucide-react"
import { DashboardProfile } from "@/components/dashboard/dashboard-profile"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
  { name: "My Credentials", href: "/dashboard/my-credentials", icon: Award, count: 12 },
  { name: "Verification", href: "/dashboard/verification", icon: FileText },
  { name: "Network", href: "/dashboard/network", icon: Users },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const response = await fetch("/api/users/me", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Token is invalid, redirect to login
          localStorage.removeItem("token")
          window.location.href = "/login"
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    fetchUser()
  }, [])
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2 hover:cursor-pointer" onClick={() => window.location.href = "/"}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Certi-fi</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
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
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center space-x-3 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{user?.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                </div>
                <User className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>My Profile</DialogTitle>
              </DialogHeader>
              <DashboardProfile />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "hidden lg:block bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}
