import type React from "react"
import { EnhancedHeader } from "@/components/header"
import { AppSidebar } from "@/components/sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col overflow-hidden">
            <EnhancedHeader />
            <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
