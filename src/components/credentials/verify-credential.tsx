"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertTriangle, FileJson, GanttChartSquare } from "lucide-react"

// Define the type for the AI verification response based on the JSON structure
export type VerificationResult = {
  data: {
    fields: {
      course_name: string | null
      date: string | null
      issuing_body: string | null
      student_name: string | null
      verify_link: string | null
    }
    forgery: {
      brief: {
        reasons: string[]
        score: number
        suspicious: boolean
      }
      is_suspicious: boolean
    }
  }
}

type VerificationResultDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  result: VerificationResult | null
}

const DataField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value || "Not found"}</span>
  </div>
)

export function VerificationResultDialog({ isOpen, onOpenChange, result }: VerificationResultDialogProps) {
  if (!result) return null

  const isSuspicious = result.data.forgery.is_suspicious
  const forgeryScore = (result.data.forgery.brief.score * 100).toFixed(2)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuspicious ? (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )}
            AI Verification Report
          </DialogTitle>
          <DialogDescription>
            Automated analysis of the uploaded certificate.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary"><GanttChartSquare className="mr-2 h-4 w-4" />Summary</TabsTrigger>
            <TabsTrigger value="raw"><FileJson className="mr-2 h-4 w-4" />Raw JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forgery Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Forgery Status:</span>
                    <Badge variant={isSuspicious ? "destructive" : "default"} className={!isSuspicious ? "bg-green-600" : ""}>
                      {isSuspicious ? "Suspicious" : "Looks Authentic"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Suspicion Score:</span>
                    <span className={`font-semibold ${isSuspicious ? 'text-destructive' : 'text-green-600'}`}>
                      {forgeryScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">AI-Generated Reasons:</h4>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {result.data.forgery.brief.reasons.length > 0 ? (
                        result.data.forgery.brief.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))
                      ) : (
                        <li>No specific issues found.</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DataField label="Student Name" value={result.data.fields.student_name} />
                  <DataField label="Course Name" value={result.data.fields.course_name} />
                  <DataField label="Issuing Body" value={result.data.fields.issuing_body} />
                  <DataField label="Verification Link" value={result.data.fields.verify_link} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Raw AI Response</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="w-full overflow-x-auto rounded-md bg-secondary p-4 text-xs">
                        <code>{JSON.stringify(result, null, 2)}</code>
                    </pre>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}