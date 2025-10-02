"use client"
import { useEffect,useRef,useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp, Users, BookOpen, Calendar, ExternalLink, Star, Clock } from "lucide-react"

const stats = [
  {
    title: "Total Credentials",
    value: "24",
    change: "+3 this month",
    icon: Award,
    color: "text-blue-600",
  },
  {
    title: "Skill Score",
    value: "87%",
    change: "+5% from last month",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Network Connections",
    value: "156",
    change: "+12 new connections",
    icon: Users,
    color: "text-purple-600",
  },
]

const recentActivity = [
  {
    title: "AWS Cloud Practitioner",
    provider: "Amazon Web Services",
    date: "2 days ago",
    status: "verified",
    type: "certification",
  },
  {
    title: "React Advanced Patterns",
    provider: "Frontend Masters",
    date: "1 week ago",
    status: "pending",
    type: "course",
  },
  {
    title: "Data Science Fundamentals",
    provider: "Coursera",
    date: "2 weeks ago",
    status: "verified",
    type: "specialization",
  },
]

const learningPaths = [
  {
    title: "Full Stack Developer",
    progress: 75,
    totalCredentials: 8,
    completedCredentials: 6,
    estimatedTime: "2 months",
  },
  {
    title: "Cloud Architecture",
    progress: 45,
    totalCredentials: 6,
    completedCredentials: 3,
    estimatedTime: "4 months",
  },
  {
    title: "Data Analytics",
    progress: 30,
    totalCredentials: 10,
    completedCredentials: 3,
    estimatedTime: "6 months",
  },
]

export function DashboardMain() {
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Welcome back, {user?.name}</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening with your credentials and learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="animate-slide-in-left" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground line-clamp-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Learning Paths */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="animate-slide-in-left" style={{ animationDelay: "400ms" }}>
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
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm md:text-base line-clamp-1">{activity.title}</h4>
                    <Badge variant={activity.status === "verified" ? "default" : "secondary"} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{activity.provider}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Learning Paths */}
        <Card className="animate-slide-in-right" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BookOpen className="h-5 w-5" />
              Learning Paths
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Track your progress towards career goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningPaths.map((path, index) => (
              <div key={index} className="space-y-3 p-3 rounded-lg border">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-sm md:text-base line-clamp-1">{path.title}</h4>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {path.estimatedTime}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm gap-2">
                    <span className="text-muted-foreground">
                      {path.completedCredentials} of {path.totalCredentials} credentials
                    </span>
                    <span className="font-medium">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>
              </div>
            ))}
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
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Award className="h-6 w-6" />
              <span className="text-xs md:text-sm">Add New Credential</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Star className="h-6 w-6" />
              <span className="text-xs md:text-sm">Request Verification</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
