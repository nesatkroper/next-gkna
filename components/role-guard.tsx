"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/auth"

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
  userRole?: UserRole
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
  userRole = "staff", // This would come from your auth context
}: RoleGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    setHasAccess(allowedRoles.includes(userRole))
  }, [allowedRoles, userRole])

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Usage example component
export function ConditionalContent() {
  return (
    <div className="space-y-4">
      <h2>Content for all users</h2>

      <RoleGuard
        allowedRoles={["admin", "manager"]}
        fallback={<p className="text-muted-foreground">This content requires manager or admin access.</p>}
      >
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-medium">Manager/Admin Only Content</h3>
          <p>This is sensitive information only for managers and admins.</p>
        </div>
      </RoleGuard>

      <RoleGuard allowedRoles={["admin"]} fallback={<p className="text-muted-foreground">Admin access required.</p>}>
        <div className="rounded-lg bg-red-50 p-4">
          <h3 className="font-medium">Admin Only Content</h3>
          <p>This is highly sensitive admin-only information.</p>
        </div>
      </RoleGuard>
    </div>
  )
}
