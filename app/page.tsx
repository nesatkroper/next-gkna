"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Leaf, BarChart3, Users } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">FertilizerMS</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Complete Fertilizer Management System</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Features Section */}

          {isMobile ? "" : <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
            <div className="grid gap-4">
              {[
                {
                  icon: Package,
                  title: "Inventory Management",
                  description: "Track fertilizer stock levels, manage suppliers, and automate reordering",
                },
                {
                  icon: BarChart3,
                  title: "Sales Analytics",
                  description: "Monitor sales performance, generate reports, and track revenue",
                },
                {
                  icon: Users,
                  title: "Customer Management",
                  description: "Manage customer relationships, track orders, and payment history",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <feature.icon className="h-8 w-8 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>}

          {/* Login Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="admin@fertilizer.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
