"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/credentials/upload-drop";
import { VerificationResult, VerificationResultDialog } from "@/components/credentials/verify-credential";
import DigilockerPopup from "@/components/digilocker/DigilockerPopup";

const NSQF_MODEL_URL = "http://localhost:4500";

// --- INTERFACES AND TYPES ---
type VerifyValues = {
  name: string;
  issued_to: string;
  issued_by: string;
  passed_at: string;
  verification_link?: string;
  nsqf_level_display?: string;
  syllabus: string;
  outcomes: string;
  jobs: string;
  duration?: string;
  credits?: number;
  projects?: string;
};

type CertificateData = {
  _id: string;
  course: string;
  issued_to: string;
  is_verified: boolean;
  createdAt: string;
};

type NsqfRequest = {
  courseName: string;
  syllabusCovered: string;
  jobDescription: string;
};

type NsqfResponse = {
  predicted_nsqf: number;
  doubled_int: number;
  keywords: string[];
  tags: string[];
};

export default function VerifyPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [certificates, setCertificates] = React.useState<CertificateData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isResultModalOpen, setIsResultModalOpen] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<VerificationResult | null>(null);
  const [digilockerOpen, setDigilockerOpen] = React.useState(false);
  const [certifMedium, setCertifMedium] = React.useState<"upload" | "digilocker">("upload");
  const [nsqfLevel, setNsqfLevel] = React.useState<NsqfResponse>({} as NsqfResponse);

  const form = useForm<VerifyValues>({
    defaultValues: {
      name: "",
      issued_to: "",
      issued_by: "",
      passed_at: "",
      verification_link: "",
      nsqf_level_display: "",
      syllabus: "",
      outcomes: "",
      jobs: "",
      duration: "",
      credits: 0,
      projects: "",
    },
    mode: "onBlur",
  });

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch('/api/certificate/get', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        setCertificates([]);
        return;
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      toast.error("Could not fetch recent submissions.");
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchNsqfLevel = async () => {
    const name = form.getValues("name");
    const syllabus = form.getValues("syllabus");
    const jobs = form.getValues("jobs");
    // 1. Get duration from form
    const durationStr = form.getValues("duration");
    const duration = parseFloat(durationStr || "0");

    if (!name) { toast.error("Course/Certificate name is required"); return; }
    if (!syllabus) { toast.error("Syllabus is required"); return; }
    if (!jobs) { toast.error("Job roles you are looking for are required"); return; }

    // 2. Validate duration (> 7.5 hours) for PREDICTION
    if (isNaN(duration) || duration <= 7.5) {
      toast.error("Course duration must be greater than 7.5 hours to calculate NSQF level.");
      return; 
    }

    let submissionToastId: string | number | undefined;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const formData = {} as NsqfRequest;
      formData["courseName"] = name;
      formData["syllabusCovered"] = syllabus;
      formData["jobDescription"] = jobs;

      const response = await fetch(`${NSQF_MODEL_URL}/predict`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      let { predicted_nsqf, doubled_int, keywords, tags } = result as NsqfResponse;
      if (!predicted_nsqf || !doubled_int) throw new Error("Invalid response from NSQF model");

      // 3. Apply NSQF Adjustment Logic based on Duration (Boost logic lives here)
      if (duration > 70) {
        predicted_nsqf += 4;
      } else if (duration > 30) {
        predicted_nsqf += 2;
      }

      setNsqfLevel({ predicted_nsqf, doubled_int, keywords, tags });
      form.setValue("nsqf_level_display", predicted_nsqf.toString());

      submissionToastId = toast.success(result.message || "successfully fetched NSQF level!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      if (submissionToastId) {
        toast.error(`Operation failed: ${errorMessage}`, { id: submissionToastId });
      } else {
        toast.error(`Submission failed: ${errorMessage}`);
      }
    }
  };

  const onSubmit = async (values: VerifyValues) => {
    console.log("[debug]: current certifMedium:", certifMedium);
    if (!values.name) { toast.error("Course/Certificate name is required"); return; }
    if (!values.issued_to) { toast.error("Issued To field is required"); return; }
    if (!values.issued_by) { toast.error("Issued By field is required"); return; }
    if (!values.passed_at) { toast.error("Date of passing is required"); return; }
    if (!values.syllabus) { toast.error("Syllabus is required"); return; }
    if (!values.outcomes) { toast.error("Course outcomes are required"); return; }
    if (!values.jobs) { toast.error("Job roles you are looking for are required"); return; }
    if (!nsqfLevel.predicted_nsqf) { toast.error("Please fetch your NSQF level before submitting."); return; }
    if (!file) { toast.error("Please upload your image certificate."); return; }

    const durationVal = parseFloat(values.duration || "0");
    if (isNaN(durationVal) || durationVal <= 7.5) {
      toast.error("Course duration must be greater than 7.5 hours.");
      return;
    }

    setSubmitting(true);
    let submissionToastId: string | number | undefined;

    try {
      const token = localStorage.getItem("token"); 
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const formData = new FormData();
      formData.append("certificate", file);
      formData.append("course", values.name);
      formData.append("issued_to", values.issued_to);
      formData.append("issued_by", values.issued_by);
      formData.append("passed_at", values.passed_at);
      formData.append("verification_link", values.verification_link as string);

      formData.append("syllabus", values.syllabus);
      formData.append("outcomes", values.outcomes);
      formData.append("jobs", values.jobs);

      // ✅ FIX 1: Send 'course_duration' to match backend schema (was sending 'duration')
      if (values.duration) {
        formData.append("course_duration", values.duration);
      }
      
      if (values.credits) formData.append("credits", values.credits.toString());
      if (values.projects) formData.append("projects", values.projects);

      formData.append("certif_medium", certifMedium);

      // ✅ FIX 2: Use the value directly from state (already calculated in fetchNsqfLevel)
      // Removed the duplicate logic that was adding +2/+4 again.
      formData.append("nsqf_level", nsqfLevel.predicted_nsqf.toString());

      formData.append("confidence", nsqfLevel.doubled_int?.toString() || "0");
      formData.append("tags", JSON.stringify(nsqfLevel.tags || []));
      formData.append("keywords", JSON.stringify(nsqfLevel.keywords || []));

      const response = await fetch("/api/certificate/add", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      submissionToastId = toast.success(result.message || "Certificate submitted successfully!");

      form.reset();
      setFile(null);
      await fetchCertificates();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      if (submissionToastId) {
        toast.error(`Operation failed: ${errorMessage}`, { id: submissionToastId });
      } else {
        toast.error(`Submission failed: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <VerificationResultDialog
        isOpen={isResultModalOpen}
        onOpenChange={setIsResultModalOpen}
        result={verificationResult}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Verify a Certificate
            </h1>
            <p className="text-pretty text-sm text-muted-foreground">
              Upload your certificate and provide details to get it verified.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <a href="/credentials">My Credentials</a>
          </Button>
        </div>
        <Button className="mb-4" variant="outline" onClick={() => setDigilockerOpen(true)}>
          Add using Digilocker
        </Button>

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
                  <UploadDropzone
                    value={file}
                    onChange={(f) => {
                      setFile(f);
                      if (f) setCertifMedium("upload");
                    }}
                  />

                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course/Certificate Name*</FormLabel>
                      <FormControl><Input placeholder="e.g., Certified Cloud Practitioner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="issued_to" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issued To*</FormLabel>
                        <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="issued_by" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issued By*</FormLabel>
                        <FormControl><Input placeholder="e.g., Amazon Web Services" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="passed_at" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Passing*</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="verification_link" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Link</FormLabel>
                        <FormControl><Input placeholder="https://www.credly.com/your-badge-link" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <hr />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Hours)</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g. 40" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="credits" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credits acquired</FormLabel>
                        <FormControl><Input inputMode="numeric" placeholder="e.g. 12" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="syllabus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syllabus*</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="Outline the key topics covered in the course..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="outcomes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course outcomes*</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="List the learning outcomes achieved..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="jobs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Roles you are looking for*</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Describe the role(s) this prepares you for..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="projects" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects completed during course</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Briefly describe notable projects completed..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="nsqf_level_display" render={({ field }) => (
                      <FormItem>
                        <FormLabel>NSQF Level</FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            placeholder="Generated NSQF Level e.g. 4.5" {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button
                      type="button"
                      onClick={fetchNsqfLevel}
                      variant="default"
                      className="mt-6"
                    >
                      Get My NSQF Level
                    </Button>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="reset"
                      variant="ghost"
                      onClick={() => { form.reset(); setFile(null); }}>
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}>
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
              <CardDescription className="text-muted-foreground">Tips for submission</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <li>Ensure your uploaded file is a valid PDF.</li>
              <li>Fill in all required fields accurately.</li>
              <li>The verification link should be publicly accessible.</li>
              <li>You can review verified items in <a className="underline underline-offset-4" href="/credentials">My Credentials</a>.</li>
            </CardContent>
          </Card>
        </div>
      </main>
      <DigilockerPopup
        open={digilockerOpen}
        onOpenChange={setDigilockerOpen}
        onCertificateSelect={(cert) => {
          if (cert?.file) {
            try {
              const arr = cert.file.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || cert.contentType || 'image/png';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const extension = mime.split('/')[1] || 'png';
              const filename = `${cert.name || 'digilocker-certificate'}.${extension}`;
              const fileObj = new File([u8arr], filename, { type: mime });
              setFile(fileObj);
              if (cert.name) {
                form.setValue("issued_to", cert.name);
              }
              toast.success("Certificate loaded from Digilocker");
              setCertifMedium("digilocker");
            } catch (error) {
              console.error("Error converting Digilocker file:", error);
              toast.error("Failed to process Digilocker certificate");
            }
          }
        }}
      />
    </>
  );
}