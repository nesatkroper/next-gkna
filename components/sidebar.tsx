"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Building2,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAppStore } from "@/lib/store/use-app-store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { products, categories, customers, employees, departments, positions, isLoadingDepartments, isLoadingPositions, isLoadingCustomers, isLoadingEmployees, isLoadingProducts, isLoadingCategories, fetchCustomers, fetchEmployees, fetchProducts, fetchCategories, fetchDepartments, fetchPositions } = useAppStore()

  React.useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories)
      fetchCategories()
    if (products.length === 0 && !isLoadingProducts)
      fetchProducts()
    if (employees.length === 0 && !isLoadingEmployees)
      fetchEmployees()
    if (customers.length === 0 && !isLoadingCustomers)
      fetchCustomers()
    if (departments.length === 0 && !isLoadingDepartments)
      fetchDepartments()
    if (positions.length === 0 && !isLoadingPositions)
      fetchPositions()
  }, [])

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory",
      icon: Package,
      children: [
        { name: "Products", href: "/dashboard/products", badge: products.length },
        { name: "Categories", href: "/dashboard/categories", badge: categories.length },
        { name: "Stock Management", href: "/dashboard/inventory", badge: 12 },
      ],
    },
    {
      name: "People",
      icon: Users,
      children: [
        { name: "Customers", href: "/dashboard/customers", badge: customers.length },
        { name: "Employees", href: "/dashboard/employees", badge: employees.length },
        { name: "Suppliers", href: "/dashboard/suppliers", badge: 15 },
      ],
    },
    {
      name: "Organization",
      icon: Building2,
      children: [
        { name: "Departments", href: "/dashboard/departments", badge: departments.length },
        { name: "Positions", href: "/dashboard/positions", badge: positions.length },
      ],
    },
    {
      name: "Operations",
      icon: ShoppingCart,
      children: [
        { name: "Sales", href: "/dashboard/sales", badge: 45 },
        { name: "Attendance", href: "/dashboard/attendance", badge: "new" },
        { name: "Payments", href: "/dashboard/payments", badge: 8 },
      ],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">FS</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Fertilizer System</span>
                  <span className="truncate text-xs text-muted-foreground">v1.1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (item.children) {
                  return (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={item.name === "Inventory" || item.name === "People"}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.name}>
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                  <Link href={subItem.href}>
                                    <span>{subItem.name}</span>
                                    {subItem.badge && (
                                      <Badge
                                        variant={subItem.badge === "new" ? "default" : "secondary"}
                                        className="ml-auto text-xs h-5 px-1.5"
                                      >
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}



// "use client"

// import type React from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"
// import {
//   LayoutDashboard,
//   Package,
//   Users,
//   ShoppingCart,
//   BarChart3,
//   Settings,
//   Building2,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react"
// import { useEffect, useState } from "react"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { useAppStore } from "@/lib/store/use-app-store"
// import { useIsMobile } from "@/hooks/use-mobile"

// export function Sidebar() {
//   const isMobile = useIsMobile();
//   const [openSections, setOpenSections] = useState<string[]>(["Inventory", "People"])
//   const {
//     products,
//     categories,
//     isLoadingProducts,
//     isLoadingCategories,
//     fetchProducts,
//     fetchCategories,
//   } = useAppStore()
//   const pathname = usePathname()

//   useEffect(() => {
//     if (categories.length === 0 && !isLoadingCategories) {
//       fetchCategories()
//     }
//     if (products.length === 0 && !isLoadingProducts) {
//       fetchProducts()
//     }
//   }, [])

//   const navigation = [
//     {
//       name: "Dashboard",
//       href: "/dashboard",
//       icon: LayoutDashboard,
//       current: false,
//     },
//     {
//       name: "Inventory",
//       icon: Package,
//       children: [
//         { name: "Products", href: "/dashboard/products", badge: products.length },
//         { name: "Categories", href: "/dashboard/categories", badge: categories.length },
//         { name: "Stock Management", href: "/dashboard/inventory", badge: "12" },
//       ],
//     },
//     {
//       name: "People",
//       icon: Users,
//       children: [
//         { name: "Customers", href: "/dashboard/customers", badge: "89" },
//         { name: "Employees", href: "/dashboard/employees", badge: "24" },
//         { name: "Suppliers", href: "/dashboard/suppliers", badge: "15" },
//       ],
//     },
//     {
//       name: "Organization",
//       icon: Building2,
//       children: [
//         { name: "Departments", href: "/dashboard/departments", badge: "6" },
//         { name: "Positions", href: "/dashboard/positions", badge: "12" },
//       ],
//     },
//     {
//       name: "Operations",
//       icon: ShoppingCart,
//       children: [
//         { name: "Sales", href: "/dashboard/sales", badge: "45" },
//         { name: "Attendance", href: "/dashboard/attendance", badge: "new" },
//         { name: "Payments", href: "/dashboard/payments", badge: "8" },
//       ],
//     },
//     {
//       name: "Reports",
//       href: "/dashboard/reports",
//       icon: BarChart3,
//       current: false,
//     },
//     {
//       name: "Settings",
//       href: "/dashboard/settings",
//       icon: Settings,
//       current: false,
//     },
//   ]

//   const toggleSection = (sectionName: string) => {
//     setOpenSections((prev) =>
//       prev.includes(sectionName) ? prev.filter((name) => name !== sectionName) : [...prev, sectionName],
//     )
//   }

//   return (
//     <div className="flex h-full w-64 flex-col bg-background border-r">
//       {/* Logo */}
//       <div className="flex h-16 items-center border-b px-6">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//             <span className="text-primary-foreground font-bold text-sm">FS</span>
//           </div>
//           <div>
//             <h1 className="font-semibold text-sm">Fertilizer System</h1>
//             <p className="text-xs text-muted-foreground">v2.1.0</p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <ScrollArea className="flex-1 px-3 py-4">
//         <nav className="space-y-2">
//           {navigation.map((item) => {
//             if (item.children) {
//               const isOpen = openSections.includes(item.name)
//               return (
//                 <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
//                   <CollapsibleTrigger asChild>
//                     <Button variant="ghost" className="w-full justify-between h-10 px-3">
//                       <div className="flex items-center gap-3">
//                         <item.icon className="h-4 w-4" />
//                         <span className="text-sm font-medium">{item.name}</span>
//                       </div>
//                       {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                     </Button>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent className="space-y-1 mt-1">
//                     {item.children.map((child) => (
//                       <Link key={child.href} href={child.href}>
//                         <Button
//                           variant={pathname === child.href ? "secondary" : "ghost"}
//                           className={cn(
//                             "w-full justify-between h-9 px-6 text-sm",
//                             pathname === child.href && "bg-secondary",
//                           )}
//                         >
//                           <span>{child.name}</span>
//                           {child.badge && (
//                             <Badge variant={child.badge === "new" ? "default" : "secondary"} className="text-xs h-5">
//                               {child.badge}
//                             </Badge>
//                           )}
//                         </Button>
//                       </Link>
//                     ))}
//                   </CollapsibleContent>
//                 </Collapsible>
//               )
//             }

//             return (
//               <Link key={item.name} href={item.href}>
//                 <Button
//                   variant={pathname === item.href ? "secondary" : "ghost"}
//                   className={cn("w-full justify-start h-10 px-3", pathname === item.href && "bg-secondary")}
//                 >
//                   <item.icon className="mr-3 h-4 w-4" />
//                   <span className="text-sm font-medium">{item.name}</span>
//                 </Button>
//               </Link>
//             )
//           })}
//         </nav>
//       </ScrollArea>

//       {/* Footer */}
//       <div className="border-t p-4">
//         <div className="flex items-center gap-3 text-sm text-muted-foreground">
//           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//           <span>System Online</span>
//         </div>
//       </div>
//     </div>
//   )
// }
