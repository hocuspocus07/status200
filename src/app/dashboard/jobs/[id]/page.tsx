"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Briefcase, MapPin, Building2, ListChecks, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

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
}

export default function JobApplyPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const jobId = params?.id
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    resumeUrl: "",
    coverLetter: "",
  })

  useEffect(() => {
    if (!jobId) return
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login") // FIX: Use router instead of window.location
      return
    }
    void fetchJob()
  }, [jobId, router])

  async function fetchJob() {
    if (!jobId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) {
        throw new Error("Unable to load job")
      }
      const data = await res.json()
      setJob(data.job)
    } catch (error) {
      console.error(error)
      toast.error("Job could not be found")
    } finally {
      setLoading(false)
    }
  }

  async function submitApplication() {
    if (!jobId) {
      toast.error("Missing job identifier")
      return
    }
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    if (!form.coverLetter.trim()) {
      toast.error("Add a short cover letter to introduce yourself.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeUrl: form.resumeUrl.trim() || undefined,
          coverLetter: form.coverLetter.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to submit application")
        return
      }

      toast.success("Application submitted. We'll let the employer know!")
      router.push("/dashboard/jobs")
    } catch (error) {
      console.error(error)
      toast.error("Unable to submit application right now")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!jobId || !job) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Job not found</CardTitle>
            <CardDescription>The role you were looking for might have been removed.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild>
              <Link href="/dashboard/jobs">Back to jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" className="gap-2" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </Button>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Briefcase className="h-5 w-5" />
              <span className="uppercase text-xs tracking-wider font-semibold">Job overview</span>
            </div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="space-y-1">
              <span className="text-base font-medium text-foreground flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
              </span>
              <span className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-2">
                <Badge variant="secondary">{job.jobType}</Badge>
                {job.remote && <Badge variant="outline">Remote</Badge>}
                {job.salaryRange?.min && (
                  <span>
                    Salary ${job.salaryRange.min.toLocaleString()}
                    {job.salaryRange?.max ? ` - $${job.salaryRange.max.toLocaleString()}` : "+"}
                  </span>
                )}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">About the job</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{job.description}</p>
            </section>

            {job.requirements && job.requirements.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold">Requirements</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  {job.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </section>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit your application</CardTitle>
            <CardDescription>Share a link to your resume and a short cover letter.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Resume (PDF/DOC)</label>

              <label
                htmlFor="resume-upload"
                className={`
                  flex items-center justify-center gap-2 px-4 py-2 rounded-md border 
                  cursor-pointer text-sm transition-all 
                  ${uploading
                    ? "border-primary bg-primary/10 text-primary animate-pulse cursor-not-allowed"
                    : "border-muted-foreground/30 hover:border-primary hover:text-primary active:scale-95"
                  }
                `}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : form.resumeUrl ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Resume Uploaded
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </label>

              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return

                  setUploading(true)
                  const toastId = toast.loading("Uploading resume...")

                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    // Ensure this env variable is set
                    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                    if (!uploadPreset) throw new Error("Missing Cloudinary Upload Preset");

                    formData.append("upload_preset", uploadPreset);

                    // REMOVED: type='upload' and access_mode='public' to prevent conflicts with preset defaults

                    // FIX: Use /auto/upload instead of /raw/upload to handle PDFs correctly
                    const uploadRes = await fetch(
                      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    const data = await uploadRes.json();

                    if (!uploadRes.ok) {
                      throw new Error(data.error?.message || "Upload failed");
                    }

                    if (data.secure_url) {
                      toast.success("Resume uploaded successfully", { id: toastId });
                      setForm((prev) => ({ ...prev, resumeUrl: data.secure_url }));
                    } else {
                      throw new Error("No secure url received");
                    }
                  } catch (error: any) {
                    console.error(error);
                    // Show the actual error message from Cloudinary if available
                    toast.error(error.message || "Something went wrong during upload", { id: toastId });
                  } finally {
                    setUploading(false);
                    // Reset file input so the same file can be selected again if needed
                    event.target.value = "";
                  }
                }}
              />

              {form.resumeUrl && (
                <a
                  href={form.resumeUrl}
                  target="_blank"
                  className="text-xs text-primary underline block mt-1"
                  rel="noopener noreferrer"
                >
                  View uploaded resume
                </a>
              )}

              <p className="text-xs text-muted-foreground">
                Upload PDF or DOC file. Max ~10MB.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover letter *</label>
              <Textarea
                rows={6}
                value={form.coverLetter}
                placeholder="Explain why you are a great fit for this role..."
                onChange={(event) => setForm({ ...form, coverLetter: event.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={submitApplication} disabled={submitting || !form.coverLetter || uploading}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}