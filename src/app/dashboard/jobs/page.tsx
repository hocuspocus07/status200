"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Briefcase, MapPin, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type BaseJob = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  tags?: string[];
  createdAt?: string
};

type Job = BaseJob & {
  jobType: string
  salaryRange?: { min?: number; max?: number }
  remote?: boolean
}

type ExternalJob = BaseJob & {
  posted: string;
  updatedAt: string;

  jobLink: string,
  companyLink: string,
  companyLogo: string,
  jobId: string,
};

type UnifiedJob = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  tags?: string[];
  createdAt?: string;
  isExternal: boolean;
  jobType?: string;
  remote?: boolean;
  salaryRange?: { min?: number; max?: number };
  jobLink?: string;
};

const EXTERNAL_JOBS_SERVICE = process.env.NEXT_PUBLIC_EXTERNAL_JOBS_SERVICE || "http://localhost:7700";

const initialFilters = {
  q: "",
  location: "",
  jobType: "",
  remoteOnly: false,
}

export default function JobsBrowsePage() {
  const [tokenChecked, setTokenChecked] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
  const [allJobs, setAllJobs] = useState<UnifiedJob[]>([]);
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
      console.error("Error fetching jobs:", error)
      setJobs([])
    }

    // Load external jobs separately - don't let this failure affect internal jobs
    try {
      const externalRes = await fetch(`${EXTERNAL_JOBS_SERVICE}/jobs/all`);
      if (!externalRes.ok) {
        throw new Error("Failed to fetch external jobs");
      }
      const externalData = await externalRes.json();
      // console.log('[debug]: externalData: ', externalData);
      setExternalJobs(Array.isArray(externalData) ? externalData : []);
    } catch (error) {
      console.error("Error fetching external jobs:", error)
      setExternalJobs([])
    } finally {
      setLoading(false)
    }
  }

  // Merge jobs whenever jobs or externalJobs change
  useEffect(() => {
    const internalJobsNormalized: UnifiedJob[] = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      tags: job.requirements,
      createdAt: job.createdAt,
      isExternal: false,
      jobType: job.jobType,
      remote: job.remote,
      salaryRange: job.salaryRange,
    }));

    const externalJobsNormalized: UnifiedJob[] = externalJobs.map(job => ({
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      tags: job.tags,
      createdAt: job.createdAt,
      isExternal: true,
      jobLink: job.jobLink,
    }));

    setAllJobs([...internalJobsNormalized, ...externalJobsNormalized]);
  }, [jobs, externalJobs]);

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
          ) : allJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No jobs match the filters</CardTitle>
                <CardDescription>Try adjusting your search to discover more roles.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            allJobs.map((job, idx) => (
              <Card key={job._id} className="hover:border-primary/60 transition-colors">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        {job.title}
                        {idx < 3 && !job.isExternal && <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">New</span>}
                        {job.isExternal && <span className="text-sm text-muted-foreground"> (external)</span>}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{job.company}</span>
                        <span className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.isExternal ? "External" : job.jobType}</Badge>
                  </div>
                  {!job.isExternal && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {job.remote && <Badge variant="outline">Remote friendly</Badge>}
                      {job.salaryRange?.min && (
                        <span>
                          Salary: ${job.salaryRange.min.toLocaleString()}{" "}
                          {job.salaryRange?.max ? `- $${job.salaryRange.max.toLocaleString()}` : "+"}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.slice(0, 4).map((tag, idx) => (
                        <Badge key={`${tag}-${idx}`} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{job.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
                    </p>
                    <Button asChild>
                      {job.isExternal ? (
                        <Link href={job.jobLink || "#"} target="_blank" rel="noopener noreferrer">View & Apply</Link>
                      ) : (
                        <Link href={`/dashboard/jobs/${job._id}`}>View & Apply</Link>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </main>
  )
}