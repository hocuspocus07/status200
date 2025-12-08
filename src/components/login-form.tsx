"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react" // Import useRef
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import ReCAPTCHA from "react-google-recaptcha" // Import ReCAPTCHA

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // CAPTCHA STATE
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // 1. Check if Captcha is solved on client
    if (!captchaToken) {
      setError("Please complete the captcha")
      toast.error("Please complete the captcha")
      setIsLoading(false)
      return
    }

    try {
      // 2. Verify Captcha with Backend
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      })

      const captchaData = await captchaRes.json()

      if (!captchaRes.ok || !captchaData.success) {
        setError("Captcha verification failed. Please try again.")
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        setIsLoading(false)
        return
      }

      // 3. If Captcha is valid, proceed with Login
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        // Optional: Reset captcha on bad password to prevent brute force
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      } else {
        setSuccess("Login successful!")
        toast.success("Login successful!")
        localStorage.setItem("token", data.token)
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error(err)
      setError("Unexpected error occurred")
      toast.error("Unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* CAPTCHA COMPONENT */}
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || !captchaToken}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <Button variant="outline" className="w-full" type="button">
              Login with Google
            </Button>

            <div className="text-center text-sm mt-2">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}