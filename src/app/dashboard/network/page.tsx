"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { Filters, type NetworkFiltersState } from "@/components/network/filters"
import { UserCard } from "@/components/network/user-card"
import { ProfileSheet } from "@/components/network/profile-sheet"
import { MessageDialog } from "@/components/network/message"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { ProfileData } from "@/components/network/types"

const fetcher = async(url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then((r) => r.json())
}

export default function NetworkPage() {
  const { data, isLoading, error } = useSWR<{ users: ProfileData[] }>("/api/users/all", fetcher)
  
  const [filters, setFilters] = useState<NetworkFiltersState>({
    query: "",
    role: "all",
    location: "all",
    verifiedOnly: false,
    sort: "name", 
  })
  
  const [selectedUser, setSelectedUser] = useState<ProfileData | null>(null)
  const [chatUser, setChatUser] = useState<ProfileData | null>(null)

  const filtered = useMemo(() => {
    console.log("Raw data from SWR:", data)
    if (!data?.users) return []
    let list = [...data.users]

    const q = filters.query.trim().toLowerCase()
    if (q) {
      list = list.filter((u) => {
        const hay = `${u.name} ${u.headline || ""} ${u.skills?.join(" ") || ""}`.toLowerCase()
        return hay.includes(q)
      })
    }

    if (filters.role !== "all") {
      list = list.filter((u) => u.headline?.toLowerCase().includes(filters.role.toLowerCase()))
    }
    if (filters.location !== "all") {
      list = list.filter((u) => u.location === filters.location)
    }
    if (filters.verifiedOnly) {
      list = list.filter((u) => u.isVerified)
    }

    switch (filters.sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "location":
        list.sort((a, b) => (a.location || "").localeCompare(b.location || ""))
        break
    }

    return list
  }, [data, filters])

  return (
    <main className={cn("px-4 py-6 md:px-8")}>
      <section aria-labelledby="network-title" className="mb-6">
        <h1 id="network-title" className="text-2xl font-semibold text-foreground text-balance">
          Network
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover professionals, filter by expertise or location, view profiles, and start a conversation.
        </p>
      </section>

      <Filters value={filters} onChange={setFilters} />

      {error ? (
        <div className="mt-6 text-center text-destructive">Failed to load users. Please try again later.</div>
      ) : isLoading ? (
        <div className="mt-6 flex justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UserCard 
              key={u._id} 
              user={u} 
              onOpenProfile={() => setSelectedUser(u)} 
              onMessage={() => setChatUser(u)} 
            />
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="text-muted-foreground col-span-full text-center">
              No users match your filters.
            </div>
          )}
        </div>
      )}

      <ProfileSheet
        user={selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        onMessage={() => {
          if (selectedUser) {
            setChatUser(selectedUser)
            setSelectedUser(null)
          }
        }}
      />

      <MessageDialog 
        user={chatUser} 
        onOpenChange={(open) => !open && setChatUser(null)} 
      />
    </main>
  )
}