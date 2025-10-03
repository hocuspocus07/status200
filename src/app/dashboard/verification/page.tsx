"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { UploadDropzone } from "@/components/credentials/upload-drop"

type VerifyValues = {
  name: string
  syllabus: string
  outcomes: string
  jobs: string
  duration?: string
  credits?: number
  projects?: string
}

export default function VerifyPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<VerifyValues>({
    defaultValues: {
      name: "",
      syllabus: "",
      outcomes: "",
      jobs: "",
      duration: "",
      credits: undefined,
      projects: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async (values: VerifyValues) => {
    if (!values.name || values.name.trim().length < 2) {
      toast("Course/Certificate name is required")
      return
    }
    if (!values.syllabus || values.syllabus.trim().length < 10) {
      toast("Syllabus is required")
      return
    }
    if (!values.outcomes || values.outcomes.trim().length < 10) {
      toast("Course outcomes are required")
      return
    }
    if (!values.jobs || values.jobs.trim().length < 10) {
      toast("Job opportunities are required")
      return
    }
    if (values.credits !== undefined && (isNaN(values.credits) || values.credits < 0)) {
      toast("Credits must be a non-negative number")
      return
    }
    if (!file) {
      toast("Please upload your certificate PDF.")
      return
    }

    try {
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 900))
      toast("Your certificate has been submitted for verification.")
      form.reset()
      setFile(null)
    } catch (e) {
      toast("Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Verify a Certificate
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Upload your certificate PDF and provide details to get it verified and added to your credentials.
          </p>
        </div>
        <Button asChild variant="ghost" className="hidden md:inline-flex">
          <Link href="/credentials">My Credentials</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 transition-all hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Verification Form</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fields marked with an asterisk are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <UploadDropzone value={file} onChange={setFile} />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course/Certificate name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Data Analytics Professional Certificate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 6 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="credits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credits acquired</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="e.g. 12"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="syllabus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syllabus*</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Outline the key topics covered in the course..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course outcomes*</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="List the learning outcomes achieved..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job opportunities*</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Describe the roles this prepares you for..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects completed during course</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Briefly describe notable projects completed..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="reset"
                    variant="ghost"
                    onClick={() => {
                      form.reset()
                      setFile(null)
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Guidelines</CardTitle>
            <CardDescription className="text-muted-foreground">Tips to speed up verification</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>- Ensure your uploaded file is a valid PDF.</p>
            <p>- Provide a clear syllabus and concise, outcome-focused details.</p>
            <p>- Include any project summaries and credits if applicable.</p>
            <p>
              - You can review verified items in{" "}
              <Link className="underline underline-offset-4" href="/credentials">
                My Credentials
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
