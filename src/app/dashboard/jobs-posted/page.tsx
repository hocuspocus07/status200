"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Briefcase, Plus, User, Mail, Download, Eye, Calendar } from "lucide-react"
import { toast } from "sonner"

// --- Mocking useRouter for Preview Environment ---
const useRouter = () => ({
  push: (url: string) => {
    if (typeof window !== 'undefined') window.location.href = url
  }
})
// ------------------------------------------------

export default function JobsPostedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    remote: false,
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  })

  const [selectedJobApplicants, setSelectedJobApplicants] = useState<any[]>([])
  const [applicantDialogOpen, setApplicantDialogOpen] = useState(false)
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  
  // Updated state: We store the actual Signed URL, not just the app object
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // --- NEW HELPER FUNCTION TO GET SIGNED URL ---
  async function getSignedResumeUrl(jobId: string, appId: string) {
    if (!token) {
      toast.error("You must be logged in")
      return null
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}/applications/${appId}/resume`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}` // This fixes the 401
        },
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to authorize download")
        return null
      }

      const data = await res.json()
      return data.url // The signed Cloudinary URL
    } catch (error) {
      console.error("Resume fetch error:", error)
      toast.error("Network error fetching resume")
      return null
    }
  }

  // --- HANDLER FOR DOWNLOAD BUTTON ---
  async function handleDownload(appId: string) {
    if (!selectedJobId) return
    
    const url = await getSignedResumeUrl(selectedJobId, appId)
    if (url) {
      window.open(url, '_blank')
    }
  }

  // --- HANDLER FOR VIEW BUTTON ---
  async function handleView(appId: string) {
    if (!selectedJobId) return

    const url = await getSignedResumeUrl(selectedJobId, appId)
    if (url) {
      setPreviewUrl(url) // Store the signed URL for the iframe
      setResumePreviewOpen(true)
    }
  }

  async function viewApplicants(jobId: string) {
    if (!token) return

    setLoadingApplicants(true)
    setSelectedJobApplicants([])
    setSelectedJobId(jobId)

    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (res.ok) {
        setSelectedJobApplicants(data.applications || [])
        setApplicantDialogOpen(true)
      } else {
        toast.error(data.error || "Failed to load applicants")
      }
    } catch (error) {
      console.error("Error fetching applicants:", error)
      toast.error("Network error loading applicants")
    } finally {
      setLoadingApplicants(false)
    }
  }

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    const init = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        const data = await res.json()

        if (!data.user.isEmployee) {
          router.push("/dashboard")
          return
        }

        setIsEmployee(true)
        await loadJobs()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [])

  async function loadJobs() {
    try {
      const res = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Failed to load jobs", error)
    }
  }

  async function submitJob() {
    if (!form.title || !form.company || !form.description) {
      toast.error("Please fill all required fields")
      return
    }

    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      jobType: form.jobType,
      remote: form.remote,
      requirements: form.requirements.split(",").map((r) => r.trim()),
      description: form.description,
      salaryRange: {
        min: Number(form.salaryMin) || 0,
        max: Number(form.salaryMax) || 0,
      },
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to post job")
        return
      }

      toast.success("Job posted successfully")
      setOpen(false)
      setForm({
        title: "",
        company: "",
        location: "",
        jobType: "",
        remote: false,
        description: "",
        requirements: "",
        salaryMin: "",
        salaryMax: "",
      })
      loadJobs()
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  if (loading || isEmployee === null) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ... JOB POSTING HEADER AND FORM (No changes needed here) ... */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Jobs Posted
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage job listings. Applicants will show here.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
               {/* ... Job Form Content (No changes needed) ... */}
               <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Job Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <Input placeholder="Company Name *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  <Input placeholder="Job Type (e.g. Full-time)" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} />
                </div>
                <Input placeholder="Requirements (comma separated)" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Min Salary" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
                  <Input placeholder="Max Salary" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
                </div>
                <Textarea placeholder="Job Description *" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <Button className="w-full" onClick={submitJob}>Create Job</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No jobs posted yet</CardTitle>
              <CardDescription>Click "Post a Job" to create your first listing.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company} — {job.location}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => viewApplicants(job._id)} disabled={loadingApplicants}>
                      {loadingApplicants ? <Loader2 className="h-4 w-4 animate-spin" /> : "View Applicants"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </CardContent>
              </Card>
            ))}

            {/* APPLICANTS LIST DIALOG */}
            {/* MODERN APPLICANTS LIST DIALOG */}
<Dialog open={applicantDialogOpen} onOpenChange={setApplicantDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
    
    {/* 1. Header Section */}
    <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10">
      <div className="flex items-center justify-between mr-8"> {/* mr-8 to avoid overlap with close button */}
        <div>
          <DialogTitle className="text-xl font-semibold">Job Applicants</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review applications for this position.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              {selectedJobApplicants.length} Total
            </span>
        </div>
      </div>
    </DialogHeader>

    {/* 2. Scrollable Content List */}
    <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
      {selectedJobApplicants.length === 0 ? (
        
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No applicants yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-2">
            When candidates apply to this job, their profiles will appear here.
          </p>
        </div>

      ) : (
        
        /* Applicant List */
        <div className="space-y-4">
          {selectedJobApplicants.map((app) => (
            <div 
              key={app._id || Math.random()} 
              className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200"
            >
              
              {/* Avatar / Initials */}
              <div className="shrink-0">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg border border-primary/20">
                    {app.userId?.name ? app.userId.name.charAt(0).toUpperCase() : "U"}
                 </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                   
                   {/* Name & Link */}
                   <a 
                      href={`/dashboard/profiles/${app.userId?._id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-semibold text-lg hover:text-primary hover:underline truncate"
                   >
                      {app.userId?.name || "Unknown User"}
                   </a>

                   {/* Date Badge */}
                   <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 w-fit">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {app.createdAt 
                        ? new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : "Recent"}
                   </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 mr-2 text-primary/70" />
                  {app.userId?.email || "No email available"}
                </div>

                {/* Cover Letter Snippet */}
                {app.coverLetter && (
                   <div className="mt-3 relative pl-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-primary/30">
                      <p className="text-sm text-muted-foreground italic line-clamp-2">
                        "{app.coverLetter}"
                      </p>
                   </div>
                )}
                
                {/* Action Buttons Area */}
                {app.resumeUrl && selectedJobId && (
                  <div className="pt-4 mt-2 flex items-center gap-3">
                     <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors flex-1 sm:flex-none"
                        onClick={() => handleView(app._id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Resume
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 flex-1 sm:flex-none"
                        onClick={() => handleDownload(app._id)}
                      >
                          <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>

            {/* SEPARATE RESUME PREVIEW DIALOG */}
            <Dialog open={resumePreviewOpen} onOpenChange={setResumePreviewOpen}>
              <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                <DialogHeader className="px-0 pb-2 border-b shrink-0">
                  <DialogTitle className="flex items-center justify-between">
                    <span>Resume Preview</span>
                    {previewUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </a>
                      </Button>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 bg-muted/10 rounded-md overflow-hidden border">
                  {previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-none"
                      title="Resume"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading resume...
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

          </div>
        )}
      </div>
    </main>
  )
}