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
  ShieldAlert,
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
        { name: "Brand", href: "/dashboard/brands", badge: categories.length },
        { name: "Stock Management", href: "/dashboard/inventory", badge: 12 },
      ],
    },
    {
      name: "Secure",
      icon: ShieldAlert,
      children: [
        { name: "Authentication", href: "/dashboard/auth", badge: 15 },
        { name: "Role", href: "/dashboard/roles", badge: employees.length },
        // { name: "Suppliers", href: "/dashboard/suppliers", badge: 15 },
        // { name: "Authentication", href: "/dashboard/auth", badge: 15 },
      ],
    },
    {
      name: "People",
      icon: Users,
      children: [
        { name: "Employees", href: "/dashboard/employees", badge: employees.length },
        { name: "Customers", href: "/dashboard/customers", badge: customers.length },
        { name: "Suppliers", href: "/dashboard/suppliers", badge: 15 },

      ],
    },
    {
      name: "Organization",
      icon: Building2,
      children: [
        { name: "Branch", href: "/dashboard/branches", badge: departments.length },
        { name: "Departments", href: "/dashboard/departments", badge: departments.length },
        { name: "Positions", href: "/dashboard/positions", badge: positions.length },
        { name: "Addresses", href: "/dashboard/addresses", badge: positions.length },
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

      <SidebarContent className="bg-background">
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
                      defaultOpen={item.name === "Inventory"}
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

// import * as React from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import {
//   LayoutDashboard,
//   Package,
//   Users,
//   ShoppingCart,
//   BarChart3,
//   Settings,
//   Building2,
//   ChevronRight,
//   Cpu,
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
//   SidebarRail,
// } from "@/components/ui/sidebar"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { useSystemStore } from "@/stores/system-store"
// import { useProductStore } from "@/stores/product-store"
// import { useCategoryStore } from "@/stores/category-store"
// import { useCustomerStore } from "@/stores/customer-store"
// import { useEmployeeStore } from "@/stores/employee-store"
// import { useDepartmentStore } from "@/stores/department-store"
// import { usePositionStore } from "@/stores/position-store"

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const pathname = usePathname()

//   const {
//     items: systems,
//     isLoading: isLoadingSystems,
//     fetch: fetchSystems,
//   } = useSystemStore()
//   const {
//     items: products,
//     isLoading: isLoadingProducts,
//     fetch: fetchProducts,
//   } = useProductStore()
//   const {
//     items: categories,
//     isLoading: isLoadingCategories,
//     fetch: fetchCategories,
//   } = useCategoryStore()
//   const {
//     items: customers,
//     isLoading: isLoadingCustomers,
//     fetch: fetchCustomers,
//   } = useCustomerStore()
//   const {
//     items: employees,
//     isLoading: isLoadingEmployees,
//     fetch: fetchEmployees,
//   } = useEmployeeStore()
//   const {
//     items: departments,
//     isLoading: isLoadingDepartments,
//     fetch: fetchDepartments,
//   } = useDepartmentStore()
//   const {
//     items: positions,
//     isLoading: isLoadingPositions,
//     fetch: fetchPositions,
//   } = usePositionStore()

//   React.useEffect(() => {
//     if (systems.length === 0 && !isLoadingSystems) fetchSystems()
//     if (products.length === 0 && !isLoadingProducts) fetchProducts()
//     if (categories.length === 0 && !isLoadingCategories) fetchCategories()
//     if (customers.length === 0 && !isLoadingCustomers) fetchCustomers()
//     if (employees.length === 0 && !isLoadingEmployees) fetchEmployees()
//     if (departments.length === 0 && !isLoadingDepartments) fetchDepartments()
//     if (positions.length === 0 && !isLoadingPositions) fetchPositions()
//   }, [
//     systems,
//     isLoadingSystems,
//     fetchSystems,
//     products,
//     isLoadingProducts,
//     fetchProducts,
//     categories,
//     isLoadingCategories,
//     fetchCategories,
//     customers,
//     isLoadingCustomers,
//     fetchCustomers,
//     employees,
//     isLoadingEmployees,
//     fetchEmployees,
//     departments,
//     isLoadingDepartments,
//     fetchDepartments,
//     positions,
//     isLoadingPositions,
//     fetchPositions,
//   ])

//   const navigation = [
//     {
//       name: "Dashboard",
//       href: "/dashboard",
//       icon: LayoutDashboard,
//     },
//     {
//       name: "Inventory",
//       icon: Package,
//       children: [
//         { name: "Products", href: "/dashboard/products", badge: products.length },
//         { name: "Categories", href: "/dashboard/categories", badge: categories.length },
//         { name: "Stock Management", href: "/dashboard/inventory", badge: 12 },
//       ],
//     },
//     {
//       name: "People",
//       icon: Users,
//       children: [
//         { name: "Customers", href: "/dashboard/customers", badge: customers.length },
//         { name: "Employees", href: "/dashboard/employees", badge: employees.length },
//         { name: "Suppliers", href: "/dashboard/suppliers", badge: 15 },
//         { name: "Authentication", href: "/dashboard/auth", badge: 15 },
//       ],
//     },
//     {
//       name: "Organization",
//       icon: Building2,
//       children: [
//         { name: "Departments", href: "/dashboard/departments", badge: departments.length },
//         { name: "Positions", href: "/dashboard/positions", badge: positions.length },
//         { name: "Addresses", href: "/dashboard/addresses", badge: positions.length },
//       ],
//     },
//     {
//       name: "Operations",
//       icon: ShoppingCart,
//       children: [
//         { name: "Sales", href: "/dashboard/sales", badge: 45 },
//         { name: "Attendance", href: "/dashboard/attendance", badge: "new" },
//         { name: "Payments", href: "/dashboard/payments", badge: 8 },
//       ],
//     },
//     {
//       name: "System Management",
//       icon: Cpu,
//       children: [
//         { name: "Systems", href: "/dashboard/systems", badge: systems.length },
//         { name: "Roles", href: "/dashboard/roles", badge: 10 },
//       ],
//     },
//     {
//       name: "Reports",
//       href: "/dashboard/reports",
//       icon: BarChart3,
//     },
//     {
//       name: "Settings",
//       href: "/dashboard/settings",
//       icon: Settings,
//     },
//   ]

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <Link href="/dashboard">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                   <span className="font-bold text-sm">FS</span>
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">Fertilizer System</span>
//                   <span className="truncate text-xs text-muted-foreground">v1.1.0</span>
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent className="bg-background">
//         <SidebarGroup>
//           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {navigation.map((item) => {
//                 if (item.children) {
//                   return (
//                     <Collapsible
//                       key={item.name}
//                       asChild
//                       defaultOpen={
//                         item.name === "Inventory" ||
//                         item.name === "People" ||
//                         item.name === "System Management"
//                       }
//                       className="group/collapsible"
//                     >
//                       <SidebarMenuItem>
//                         <CollapsibleTrigger asChild>
//                           <SidebarMenuButton tooltip={item.name}>
//                             {item.icon && <item.icon />}
//                             <span>{item.name}</span>
//                             <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//                           </SidebarMenuButton>
//                         </CollapsibleTrigger>
//                         <CollapsibleContent>
//                           <SidebarMenuSub>
//                             {item.children.map((subItem) => (
//                               <SidebarMenuSubItem key={subItem.name}>
//                                 <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
//                                   <Link href={subItem.href}>
//                                     <span>{subItem.name}</span>
//                                     {subItem.badge && (
//                                       <Badge
//                                         variant={subItem.badge === "new" ? "default" : "secondary"}
//                                         className="ml-auto text-xs h-5 px-1.5"
//                                       >
//                                         {subItem.badge}
//                                       </Badge>
//                                     )}
//                                   </Link>
//                                 </SidebarMenuSubButton>
//                               </SidebarMenuSubItem>
//                             ))}
//                           </SidebarMenuSub>
//                         </CollapsibleContent>
//                       </SidebarMenuItem>
//                     </Collapsible>
//                   )
//                 }

//                 return (
//                   <SidebarMenuItem key={item.name}>
//                     <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
//                       <Link href={item.href}>
//                         {item.icon && <item.icon />}
//                         <span>{item.name}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 )
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton>
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span>System Online</span>
//               </div>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>

//       <SidebarRail />
//     </Sidebar>
//   )
// }