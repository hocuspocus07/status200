"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { Filters, type NetworkFiltersState } from "@/components/network/filters"
import { UserCard } from "@/components/network/user-card"
import { ProfileSheet } from "@/components/network/profile-sheet"
import { MessageDialog } from "@/components/network/message"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
type NetworkUser = {
  id: string
  name: string
  title: string
  location: string
  skills: string[]
  verified: boolean
  bio: string
  lastActive: string
  avatar: string
}

export default function NetworkPage() {
  const { data, isLoading, error } = useSWR<NetworkUser[]>("/api/users/all", fetcher)
  const [filters, setFilters] = useState<NetworkFiltersState>({
    query: "",
    role: "all",
    location: "all",
    verifiedOnly: false,
    sort: "recent",
  })
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null)
  const [chatUser, setChatUser] = useState<NetworkUser | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    let list = [...data]

    const q = filters.query.trim().toLowerCase()
    if (q) {
      list = list.filter((u) => {
        const hay = `${u.name} ${u.title} ${u.skills.join(" ")}`.toLowerCase()
        return hay.includes(q)
      })
    }

    if (filters.role !== "all") {
      list = list.filter((u) => u.title.toLowerCase().includes(filters.role.toLowerCase()))
    }
    if (filters.location !== "all") {
      list = list.filter((u) => u.location === filters.location)
    }
    if (filters.verifiedOnly) {
      list = list.filter((u) => u.verified)
    }

    switch (filters.sort) {
      case "recent":
        list.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
        break
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "location":
        list.sort((a, b) => a.location.localeCompare(b.location))
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
        <div className="mt-6 text-destructive">Failed to load users.</div>
      ) : isLoading ? (
        <div className="mt-6 text-muted-foreground">Loading users…</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} onOpenProfile={() => setSelectedUser(u)} onMessage={() => setChatUser(u)} />
          ))}
          {filtered.length === 0 && <div className="text-muted-foreground">No users match your filters.</div>}
        </div>
      )}

      <ProfileSheet
        user={selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        onMessage={() => {
          if (selectedUser) setChatUser(selectedUser)
        }}
      />

      <MessageDialog user={chatUser} onOpenChange={(open) => !open && setChatUser(null)} />
    </main>
  )
}
