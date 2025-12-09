"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Brain,
  FileUser,
  MapPin,
  ArrowRight
} from "lucide-react"

// --- Interfaces ---
interface Certificate {
  is_verified: boolean;
  nsqf_level?: number | string;
}

interface UserData {
  name: string;
  email: string;
  certificates: Certificate[];
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  createdAt: string;
}

export function DashboardMain() {
  const [user, setUser] = useState<UserData | null>(null)
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any | null>(null)

  // --- 1. Fetch User Data ---
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }
    fetchUser()
  }, [])

  // --- 2. Fetch Recent Internal Jobs (Platform Only) ---
  useEffect(() => {
    const fetchInternalJobs = async () => {
      try {
        const res = await fetch("/api/jobs?limit=3") 
        if (res.ok) {
          const data = await res.json()
          setRecentJobs(Array.isArray(data.jobs) ? data.jobs : [])
        }
      } catch (error) {
        console.error("Failed to load recent jobs", error)
      }
    }
    fetchInternalJobs()
  }, [])

  // --- 3. Dynamic Stats Calculation ---
  const dynamicStats = useMemo(() => {
    if (!user) return [];

    const totalCerts = user.certificates?.length || 0;
    const verifiedCerts = user.certificates?.filter(c => c.is_verified).length || 0;

    const verifiedNsqfLevels = user.certificates
      ?.filter(c => c.is_verified && c.nsqf_level && !isNaN(Number(c.nsqf_level)))
      .map(c => Number(c.nsqf_level));

    let averageNsqf = 0;
    let nsqfDisplay = "N/A";

    if (verifiedNsqfLevels?.length > 0) {
      const totalLevelSum = verifiedNsqfLevels.reduce((sum, level) => sum + level, 0);
      averageNsqf = totalLevelSum / verifiedNsqfLevels.length;
      nsqfDisplay = `${averageNsqf.toFixed(1)}`;
    }

    return [
      {
        title: "Total Credentials",
        value: totalCerts.toString(),
        change: `${verifiedCerts} Verified`,
        icon: Award,
        color: totalCerts > 0 ? "text-blue-600" : "text-gray-400",
      },
      {
        title: "Avg. NSQF Level",
        value: nsqfDisplay,
        change: `Based on ${verifiedCerts} items`,
        icon: TrendingUp,
        color: averageNsqf >= 6 ? "text-green-600" : "text-yellow-600",
      },
      {
        title: "Network Connections",
        value: "15",
        change: "+1 in 24h",
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "Jobs Applied",
        value: "3",
        change: "+2 in 24h",
        icon: FileUser,
        color: "text-green-600",
      },
    ];
  }, [user]);

  const handleRecommend = async () => {
    if (!skillInput.trim()) return
    setLoading(true)
    setRecommendations(null)
    try {
      const res = await fetch("http://localhost:4500/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: "User Skills Input",
          syllabusCovered: skillInput,
          jobDescription: skillInput,
        }),
      })
      if (!res.ok) throw new Error(`Model request failed: ${res.status}`)
      const data = await res.json()
      setRecommendations(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Here&apos;s what&apos;s happening with your credentials and learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, index) => (
          <Card
            key={stat.title}
            className="animate-slide-in-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Recommendation Model */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* --- RECENT ACTIVITY (Updated: Clickable Jobs) --- */}
        <Card
          className="animate-slide-in-left h-full flex flex-col"
          style={{ animationDelay: "400ms" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Briefcase className="h-5 w-5" />
              Recent Job Postings
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Latest opportunities posted on the platform
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 flex-1">
            {recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground text-sm">
                    <p>No internal jobs posted yet.</p>
                </div>
            ) : (
                recentJobs.map((job) => (
                <Link 
                    key={job._id} 
                    href={`/dashboard/jobs/${job._id}`}
                    className="block group"
                >
                    <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                                {job.title}
                                </h4>
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                    {job.jobType}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">{job.company}</span>
                                <span className="flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" /> {job.location}
                                </span>
                            </div>
                            
                            <p className="text-[10px] text-muted-foreground">
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </Link>
                ))
            )}
          </CardContent>
        </Card>

        {/* Recommendation AI Box */}
        <Card
          className="animate-slide-in-right h-full flex flex-col"
          style={{ animationDelay: "400ms" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Brain className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 flex-1">
            {/* Input */}
            <textarea
              className="w-full p-3 border rounded-md text-sm resize-none h-[60px] bg-background"
              placeholder="Enter your skills (e.g., React, Node.js) to get pathway suggestions..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />

            {/* Button */}
            <Button onClick={handleRecommend} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Get Recommendations"}
            </Button>

            {/* Results */}
            <div className="flex-1 border rounded-md p-3 bg-muted/20 min-h-[200px]">
              {recommendations ? (
                <div className="space-y-1 pb-2 h-full">
                  <h4 className="font-semibold text-sm">Recommended Path:</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Start Level: {recommendations.start_level}
                  </p>

                  <div className="space-y-2 h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {recommendations.pathway?.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-md shadow-sm bg-card"
                      >
                        <p className="text-sm font-medium text-primary">{p.courseName}</p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted-foreground">
                            NSQF Level: {p.NSQFLevel}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {p.syllabusCovered}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground text-center">
                  No recommendations yet. <br/> Enter your skills above.
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Common tasks to manage your credential portfolio
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 grid-cols-1">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover:bg-muted/50">
              <Link href="/dashboard/upload">
                <Award className="h-6 w-6" />
                <span className="text-xs md:text-sm">Add New Credential</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}