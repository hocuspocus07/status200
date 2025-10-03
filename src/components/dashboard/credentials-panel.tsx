"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Search, Filter, ExternalLink, Calendar, Building } from "lucide-react"

interface Credential {
  id: number;
  title: string;
  provider: string;
  issueDate: string;    // ISO date string
  expiryDate: string;   // ISO date string
  status: "verified" | "pending";
  category: string;
  level: string;
  credentialId: string;
  skills: string[];
}

const credentials: Credential[] = [
  {
    id: 1,
    title: "AWS Certified Cloud Practitioner",
    provider: "Amazon Web Services",
    issueDate: "2024-01-15",
    expiryDate: "2027-01-15",
    status: "verified",
    category: "Cloud Computing",
    level: "Foundation",
    credentialId: "AWS-CCP-2024-001",
    skills: ["Cloud Architecture", "AWS Services", "Security"],
  },
  {
    id: 2,
    title: "React Developer Certification",
    provider: "Meta",
    issueDate: "2023-12-10",
    expiryDate: "2025-12-10",
    status: "verified",
    category: "Frontend Development",
    level: "Professional",
    credentialId: "META-REACT-2023-456",
    skills: ["React", "JavaScript", "Component Design"],
  },
  {
    id: 3,
    title: "Data Science Fundamentals",
    provider: "IBM",
    issueDate: "2023-11-20",
    expiryDate: "2025-11-20",
    status: "pending",
    category: "Data Science",
    level: "Intermediate",
    credentialId: "IBM-DS-2023-789",
    skills: ["Python", "Statistics", "Machine Learning"],
  },
  {
    id: 4,
    title: "Cybersecurity Essentials",
    provider: "Cisco",
    issueDate: "2023-10-05",
    expiryDate: "2026-10-05",
    status: "verified",
    category: "Security",
    level: "Foundation",
    credentialId: "CISCO-SEC-2023-123",
    skills: ["Network Security", "Risk Assessment", "Compliance"],
  },
]

const recentCredentials = credentials.slice(0, 2)
const allCredentials = credentials

export function CredentialsPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold mb-4">My Credentials</h3>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <div className="space-y-4">
              {recentCredentials.map((credential) => (
                <CredentialCard key={credential.id} credential={credential} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search credentials..." className="pl-10" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {allCredentials.map((credential) => (
                    <CredentialCard key={credential.id} credential={credential} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-border">
        <h4 className="font-medium mb-3">Quick Stats</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">21</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-xs text-muted-foreground">Expiring Soon</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 mt-auto">
        <div className="space-y-2">
          <Button className="w-full" size="sm">
            <Award className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Share Portfolio
          </Button>
        </div>
      </div>
    </div>
  )
}

function CredentialCard({ credential }: { credential: Credential }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm leading-tight">{credential.title}</CardTitle>
            <CardDescription className="text-xs flex items-center gap-1">
              <Building className="h-3 w-3" />
              {credential.provider}
            </CardDescription>
          </div>
          <Badge variant={credential.status === "verified" ? "default" : "secondary"} className="text-xs">
            {credential.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(credential.issueDate).toLocaleDateString()}
            </div>
            <Badge variant="outline" className="text-xs">
              {credential.level}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {credential.skills.slice(0, 2).map((skill: string) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {credential.skills.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{credential.skills.length - 2}
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
