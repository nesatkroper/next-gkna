"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginFormData {
  email: string
  password: string
}

interface LoginResponse {
  message: string
  user?: {
    authId: string
    email: string
    role: string
    employee?: any
  }
  error?: string
  requiresMFA?: boolean
  tempToken?: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setError("Too many failed attempts. Please try again later.")
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          timestamp: Date.now(), // Replay attack protection
        }),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setAttempts((prev) => prev + 1)

        if (attempts >= 4) {
          setIsLocked(true)
          setTimeout(
            () => {
              setIsLocked(false)
              setAttempts(0)
            },
            15 * 60 * 1000,
          ) // 15 minutes lockout
        }

        setError(data.error || "Login failed")
        return
      }

      // Reset attempts on successful login
      setAttempts(0)

      if (data.requiresMFA) {
        // Redirect to MFA verification page
        router.push(`/auth/mfa?token=${data.tempToken}`)
      } else {
        // Successful login
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FertilizerMS</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Secure Access Portal</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle>Secure Login</CardTitle>
            </div>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLocked && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading || isLocked}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading || isLocked}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {attempts > 0 && (
                <div className="text-sm text-amber-600">
                  Warning: {attempts}/5 failed attempts. Account will be locked after 5 attempts.
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
                {isLoading ? "Signing in..." : "Sign In Securely"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Protected by enterprise-grade security</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>This system is monitored. Unauthorized access is prohibited.</p>
        </div>
      </motion.div>
    </div>
  )
}
