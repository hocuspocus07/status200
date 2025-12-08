"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Award,
  TrendingUp,
  Users,
  ExternalLink,
  Clock,
  Brain,
  FileUser,
} from "lucide-react"

interface Certificate {
  is_verified: boolean;
  nsqf_level?: number | string;
  // Add other certificate fields if needed for counting
}
interface UserData {
  name: string;
  email: string;
  certificates: Certificate[];
  // Add other user fields like skills, connections, jobs applied if they exist on your model
}
const recentActivity = [
  {
    title: "AWS Cloud Practitioner",
    provider: "Amazon Web Services",
    date: "2 days ago",
    status: "verified",
  },
  {
    title: "React Advanced Patterns",
    provider: "Frontend Masters",
    date: "1 week ago",
    status: "pending",
  },
  {
    title: "Data Science Fundamentals",
    provider: "Coursera",
    date: "2 weeks ago",
    status: "verified",
  },
]

export function DashboardMain() {
  const [user, setUser] = useState<UserData | null>(null) // Use UserData interface
  const [skillInput, setSkillInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any | null>(null)

  // --- Calculation Logic using useMemo ---
  const dynamicStats = useMemo(() => {
    if (!user) {
      // Return default/loading stats if user data isn't ready
      return [];
    }
console.log(user);
    const totalCerts = user.certificates?.length || 0;
    const verifiedCerts = user.certificates?.filter(c => c.is_verified).length || 0;

    // --- NSQF Score Calculation ---
    // Calculate the average NSQF level from all verified certificates
    const verifiedNsqfLevels = user.certificates
      ?.filter(c => c.is_verified && c.nsqf_level && !isNaN(Number(c.nsqf_level)))
      .map(c => Number(c.nsqf_level));

    let averageNsqf = 0;
    let nsqfDisplay = "N/A";

    if (verifiedNsqfLevels?.length > 0) {
      // Assuming a max NSQF level of 8 for a simple percentage score
      const totalLevelSum = verifiedNsqfLevels.reduce((sum, level) => sum + level, 0);
      const averageLevel = totalLevelSum / verifiedNsqfLevels.length;

      // For display, use a simple average level or calculate a score out of 8 (Max NSQF level)
      // Let's display the average level directly for accuracy in the context of NSQF.
      averageNsqf = averageLevel;
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
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Here&apos;s what&apos;s happening with your credentials and learning
          journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, index) => ( // Change 'stats' to 'dynamicStats'
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
        {/* Recent Activity */}
        <Card
          className="animate-slide-in-left"
          style={{ animationDelay: "400ms" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your latest credential achievements and learning progress
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm md:text-base line-clamp-1">
                      {activity.title}
                    </h4>
                    <Badge
                      variant={
                        activity.status === "verified"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.provider}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.date}
                  </p>
                </div>

                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
              AI Recommendations for courses
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 flex-1">
            {/* Input */}
            <textarea
              className="w-full p-3 border rounded-md text-sm resize-none h-[40px]"
              placeholder="Enter your skills and experience..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />

            {/* Button */}
            <Button onClick={handleRecommend} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Get Recommendations"}
            </Button>

            {/* Results */}
            <div className="flex-1 border rounded-md p-3">
              {recommendations ? (
                <div className="space-y-1 pb-2 h-full">
                  <h4 className="font-semibold text-sm">Recommended courses:</h4>

                  <p className="text-xs text-muted-foreground">
                    Start Level: {recommendations.start_level}
                  </p>

                  <div className="space-y-2 h-full overflow-y-auto pr-1">
                    {recommendations.pathway?.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 border rounded-md shadow-sm"
                      >
                        <p className="text-sm font-medium">{p.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          NSQF Level: {p.NSQFLevel}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {p.syllabusCovered}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  No recommendations yet. Enter your skills above.
                </p>
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Award className="h-6 w-6" />
              <span className="text-xs md:text-sm">Add New Credential</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-xs md:text-sm">Request Verification</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
