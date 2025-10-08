"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 md:px-6 gap-2 md:gap-4">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Dashboard</h1>
          <Badge variant="secondary" className="hidden sm:flex animate-pulse">
            3 new credentials pending
          </Badge>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search credentials..." className="w-48 lg:w-64 pl-10" />
          </div>

          <Button size="sm" className="animate-fade-in-up">
            <Link href={"/dashboard/upload"} className="flex items-center">
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Add Credential</span>
          </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
