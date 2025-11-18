"use client"
import { useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { IncomingRequestsDialog } from "./requests-dialog"

export function DashboardHeader() {
 const [token, setToken] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchPendingCount = async () => {
      try {
        const res = await fetch("/api/connections/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch pending count");
          return;
        }
        const data = await res.json();
        setPendingCount(data.requests.length);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchPendingCount();
  }, [token]);
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 md:px-6 gap-2 md:gap-4">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Dashboard</h1>
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

          <IncomingRequestsDialog
            token={token}
            pendingCount={pendingCount}
            onRequestsUpdated={setPendingCount}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
