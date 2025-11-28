"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  MessageCircleMore,
  Rocket
} from "lucide-react"

const learnerNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Credentials", href: "/dashboard/my-credentials", icon: Award },
  { name: "Pathways", href: "/dashboard/my-pathways", icon: Rocket },
  { name: "Upload a certificate", href: "/dashboard/upload", icon: FileText },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Messages", href: "/dashboard/inbox", icon: MessageCircleMore },
]

const employerNavigation = [
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Messages", href: "/dashboard/inbox", icon: MessageCircleMore },
  { name: "Jobs Posted", href: "/dashboard/jobs-posted", icon: FileText },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string; isEmployee?: boolean } | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

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
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  const navItems = user?.isEmployee ? employerNavigation : learnerNavigation

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href={"/"} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Certi-fi</span>
          </Link>
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
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1">{item.name}</span>

                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <Link
            href="/dashboard/my-profile"
            className="flex items-center space-x-3 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
            <User className="h-4 w-4 text-sidebar-foreground/60" />
          </Link>
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
