"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <Badge variant="secondary" className="animate-pulse">
            3 new credentials pending
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search credentials..." className="w-64 pl-10" />
          </div>

          {/* Actions */}
          <Button size="sm" className="animate-fade-in-up">
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
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
