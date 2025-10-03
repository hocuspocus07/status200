"use client"

import { useMemo, useState,useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, GraduationCap, MapPin, AtSign, LinkIcon, Award, Plus, Pencil, Briefcase, Mail } from "lucide-react"

type Education = {
  id: string
  institution: string
  degree: string
  field: string
  start: string
  end?: string
  current?: boolean
  description?: string
}

type Certificate = {
  id: string
  title: string
  provider: string
  issueDate: string
  status: "verified" | "pending"
}

export function DashboardProfile() {
  const [bio, setBio] = useState("")
  const [headline, setHeadline] = useState("")
  const [location, setLocation] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [skills] = useState<string[]>([])
  const initials = useMemo(() => (email ? email[0].toUpperCase() : "U"), [email])

  const [education, setEducation] = useState<Education[]>([])
  const [certificates] = useState<Certificate[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<Omit<Education, "id">>({
    institution: "",
    degree: "",
    field: "",
    start: "",
    end: "",
    current: false,
    description: "",
  })

  const handleAddEducation = () => {
    if (!form.institution || !form.degree || !form.field || !form.start) return
    const newEntry: Education = { id: crypto.randomUUID(), ...form, end: form.current ? undefined : form.end }
    setEducation((prev) => [newEntry, ...prev])
    setForm({ institution: "", degree: "", field: "", start: "", end: "", current: false, description: "" })
    setAddOpen(false)
  }

  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const response = await fetch("/api/users/me", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Token is invalid, redirect to login
          localStorage.removeItem("token")
          window.location.href = "/login"
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in-up">
      {/* Profile Header */}
      <Card className="animate-slide-in-left" style={{ animationDelay: "80ms" }}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-1">{headline}</p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 text-xs md:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" /> {location}
                  </span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 md:h-4 md:w-4" /> {user?.email}
                  </span>
                  <a
                    className="inline-flex items-center gap-1 hover:underline truncate"
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkIcon className="h-3 w-3 md:h-4 md:w-4" /> Website
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" className="bg-transparent text-sm">
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
              <Button className="text-sm">
                <Briefcase className="h-4 w-4 mr-2" /> Share Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="animate-slide-in-left" style={{ animationDelay: "160ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">About</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Let others know what drives your learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-20 md:min-h-24 text-sm"
            placeholder="Write something about your goals, interests, and achievements."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-xs md:text-sm">
                Headline
              </Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs md:text-sm">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs md:text-sm">
                Website
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="animate-slide-in-left" style={{ animationDelay: "240ms" }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base md:text-lg">Education</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Your academic and training background
              </CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs md:text-sm shrink-0">
                  <Plus className="h-4 w-4 mr-2" /> Add Education
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Education</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="institution" className="text-sm">
                      Institution
                    </Label>
                    <Input
                      id="institution"
                      value={form.institution}
                      onChange={(e) => setForm({ ...form, institution: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="degree" className="text-sm">
                        Degree
                      </Label>
                      <Input
                        id="degree"
                        value={form.degree}
                        onChange={(e) => setForm({ ...form, degree: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="field" className="text-sm">
                        Field of Study
                      </Label>
                      <Input
                        id="field"
                        value={form.field}
                        onChange={(e) => setForm({ ...form, field: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="start" className="text-sm">
                        Start Year
                      </Label>
                      <Input
                        id="start"
                        placeholder="e.g. 2019"
                        value={form.start}
                        onChange={(e) => setForm({ ...form, start: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end" className="text-sm">
                        End Year (optional)
                      </Label>
                      <Input
                        id="end"
                        placeholder="e.g. 2023"
                        value={form.current ? "" : form.end || ""}
                        onChange={(e) => setForm({ ...form, end: e.target.value })}
                        disabled={form.current}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="current"
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={!!form.current}
                        onChange={(e) => setForm({ ...form, current: e.target.checked })}
                      />
                      <Label htmlFor="current" className="text-sm">
                        I currently study here
                      </Label>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-sm">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="bg-transparent" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEducation}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((ed) => (
            <div key={ed.id} className="p-3 md:p-4 rounded-lg border flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-sm md:text-base line-clamp-2">
                      {ed.degree}
                      {ed.field ? ` — ${ed.field}` : ""}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {ed.institution}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    {ed.start} — {ed.current ? "Present" : ed.end || "—"}
                  </p>
                  {ed.description && <p className="text-xs md:text-sm mt-2 text-pretty">{ed.description}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setEducation((prev) => prev.filter((e) => e.id !== ed.id))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <div className="text-xs md:text-sm text-muted-foreground">No education added yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Snapshot */}
      <Card className="animate-slide-in-right" style={{ animationDelay: "200ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Award className="h-5 w-5" />
            Certificates
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Recently earned and pending credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg border flex flex-col sm:flex-row items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">{c.title}</h4>
                  <Badge variant={c.status === "verified" ? "default" : "secondary"} className="capitalize text-xs">
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{c.provider}</p>
                <p className="text-xs text-muted-foreground">Issued {new Date(c.issueDate).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs shrink-0">
                View
              </Button>
            </div>
          ))}
          {certificates.length === 0 && (
            <div className="text-xs md:text-sm text-muted-foreground">No certificates added yet.</div>
          )}
          <Button className="w-full bg-transparent text-xs md:text-sm" variant="outline">
            Manage All
          </Button>
        </CardContent>
      </Card>

      {/* Contact & Links */}
      <Card className="animate-slide-in-right" style={{ animationDelay: "280ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Contact</CardTitle>
          <CardDescription className="text-xs md:text-sm">Ways to reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs md:text-sm flex items-center gap-2 text-muted-foreground">
            <AtSign className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="text-xs md:text-sm flex items-center gap-2 text-muted-foreground">
            <LinkIcon className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
            <a href={website} target="_blank" rel="noreferrer" className="hover:underline truncate">
              {website}
            </a>
          </div>
          <div className="text-xs md:text-sm flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}