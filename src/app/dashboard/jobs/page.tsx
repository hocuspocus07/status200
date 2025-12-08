"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Loader2, Briefcase, MapPin, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// AL AYAAN ANSARI | Roll NO. 23BCS034

type Job = {
  _id: string
  title: string
  company: string
  location: string
  jobType: string
  description: string
  requirements?: string[]
  salaryRange?: { min?: number; max?: number }
  remote?: boolean
  createdAt?: string
}

const initialFilters = {
  q: "",
  location: "",
  jobType: "",
  remoteOnly: false,
}

export default function JobsBrowsePage() {
  const [tokenChecked, setTokenChecked] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ ...initialFilters })

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      window.location.href = "/login"
      return
    }
    setTokenChecked(true)
    void loadJobs(filters)
  }, [])

  async function loadJobs(currentFilters = filters) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const { q, location, jobType, remoteOnly } = currentFilters
      if (q.trim()) params.set("q", q.trim())
      if (location.trim()) params.set("location", location.trim())
      if (jobType.trim()) params.set("jobType", jobType.trim())
      if (remoteOnly) params.set("remote", "true")

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (!res.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await res.json()
      setJobs(Array.isArray(data.jobs) ? data.jobs : [])
    } catch (error) {
      console.error(error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const { sortedJobs, latestJobIds } = useMemo(() => {
    if (!jobs.length) return { sortedJobs: [], latestJobIds: new Set() }

    // 1. Sort by createdAt Descending (Newest first)
    // FIX: Changed from dateA - dateB to dateB - dateA
    const sorted = [...jobs].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA // Descending order
    })

    // 2. Identify the top 3 latest jobs (Newest first)
    // This remains the same to identify which ones get the "New" badge
    const latest = [...jobs]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA // Descending order
      })
      .slice(0, 3)
      .map((job) => job._id)

    return { sortedJobs: sorted, latestJobIds: new Set(latest) }
  }, [jobs])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void loadJobs(filters)
  }

  const handleReset = () => {
    const reset = { ...initialFilters }
    setFilters(reset)
    void loadJobs(reset)
  }

  if (!tokenChecked) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Briefcase className="h-6 w-6" />
            <p className="text-sm font-medium uppercase tracking-wide">Opportunities</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold">Find Your Dream Job Now</h1>
          <p className="text-sm text-muted-foreground">
            Discover open roles from verified employers on Certi-fi and apply directly with your profile.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search across title, company, and role specifics</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1 flex items-center gap-2 rounded-md border px-3 py-2">
                  <Search className="h-4 w-4" />
                  <Input
                    className="border-0 focus-visible:ring-0 px-0"
                    placeholder="Search title, company, or keywords"
                    value={filters.q}
                    onChange={(event) => setFilters({ ...filters, q: event.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(event) => setFilters({ ...filters, location: event.target.value })}
                />
                <Input
                  placeholder="Job Type e.g. Full-time"
                  value={filters.jobType}
                  onChange={(event) => setFilters({ ...filters, jobType: event.target.value })}
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={filters.remoteOnly}
                    onChange={(event) => setFilters({ ...filters, remoteOnly: event.target.checked })}
                  />
                  Remote roles only
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Apply filters</Button>
                <Button type="button" variant="ghost" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No jobs match the filters</CardTitle>
                <CardDescription>Try adjusting your search to discover more roles.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            sortedJobs.map((job) => {
              const isNew = latestJobIds.has(job._id)
              return (
                <Card key={job._id} className="hover:border-primary/60 transition-colors">
                  <CardHeader className="space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          {isNew && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 animate-in fade-in zoom-in duration-300">
                              New
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-medium text-foreground">{job.company}</span>
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{job.jobType}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {job.remote && <Badge variant="outline">Remote friendly</Badge>}
                      {job.salaryRange?.min && (
                        <span>
                          Salary: ${job.salaryRange.min.toLocaleString()}{" "}
                          {job.salaryRange?.max ? `- $${job.salaryRange.max.toLocaleString()}` : "+"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-3">{job.description}</p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 4).map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="text-xs">
                            +{job.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs">
                        Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
                      </p>
                      <Button asChild>
                        <Link href={`/dashboard/jobs/${job._id}`}>View & Apply</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}