"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, GraduationCap, Home, Award, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const dashboardLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Credentials", href: "/dashboard/my-credentials", icon: Award },
  { name: "Verification", href: "/dashboard/verification", icon: FileText },
  { name: "Network", href: "/dashboard/network", icon: Users },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsSignedIn(!!token)
  }, [])

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 hover:cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Certi-fi</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {isSignedIn ? (
              dashboardLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              ))
            ) : (
              <>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </Link>
                <Link href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Benefits
                </Link>
              </>
            )}
            <ThemeToggle />
            {!isSignedIn&&<Link href={"/register"}><Button>Get Started</Button></Link>}
          </div>

          {/* Mobile nav trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b border-border">
            {isSignedIn
              ? dashboardLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                ))
              : [
                  { name: "Features", href: "#features" },
                  { name: "How it Works", href: "#how-it-works" },
                  { name: "Benefits", href: "#benefits" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
            <div className="px-3 py-2">
              <Button className="w-full">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
