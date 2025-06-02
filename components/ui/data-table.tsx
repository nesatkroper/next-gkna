"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Eye, Search, Plus, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export type ColumnType = {
  key: string
  label: string
  type?: "text" | "number" | "date" | "currency" | "badge" | "image" | "boolean" | "custom"
  width?: string
  align?: "left" | "center" | "right"
  format?: (value: any) => string
  render?: (value: any, item: any) => React.ReactNode
  badgeVariant?: Record<string, string>
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnType[]
  idField: string
  isLoading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onAdd?: () => void
  onRefresh?: () => void
  searchable?: boolean
  className?: string
  emptyMessage?: string
  actions?: boolean
}

export function DataTable<T>({
  data,
  columns,
  idField,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  searchable = true,
  className,
  emptyMessage = "No data available",
  actions = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.entries(item as Record<string, any>).some(([key, value]) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase())
          }
          if (typeof value === "number") {
            return value.toString().includes(searchTerm)
          }
          return false
        }),
      )
    : data

  const renderCell = (item: T, column: ColumnType) => {
    const value = (item as Record<string, any>)[column.key]

    if (column.render) {
      return column.render(value, item)
    }

    switch (column.type) {
      case "image":
        return value ? (
          <div className="relative w-16 h-16 rounded-md overflow-hidden">
            <img
              src={value || "/placeholder.svg"}
              alt={`Image for ${(item as Record<string, any>)[idField]}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
              }}
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )
      case "currency":
        return typeof value === "number"
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value)
          : value
      case "date":
        return value ? new Date(value).toLocaleDateString() : ""
      case "badge":
        const variant = column.badgeVariant?.[value] || "default"
        return <Badge variant={variant as any}>{value}</Badge>
      case "boolean":
        return value ? "Yes" : "No"
      default:
        return column.format ? column.format(value) : value
    }
  }

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, rowIndex) => (
      <TableRow key={`skeleton-${rowIndex}`}>
        {columns.map((column, colIndex) => (
          <TableCell
            key={`skeleton-cell-${colIndex}`}
            className={cn("py-3", column.align === "center" && "text-center", column.align === "right" && "text-right")}
          >
            {column.type === "image" ? (
              <Skeleton className="w-16 h-16 rounded-md" />
            ) : (
              <Skeleton className="h-5 w-full max-w-[200px]" />
            )}
          </TableCell>
        ))}
        {actions && (
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </TableCell>
        )}
      </TableRow>
    ))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {searchable && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.align === "center" && "text-center", column.align === "right" && "text-right")}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={(item as Record<string, any>)[idField]}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${(item as Record<string, any>)[idField]}-${column.key}`}
                      className={cn(
                        "py-3",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button variant="ghost" size="icon" onClick={() => onView(item)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p>{searchTerm ? "No results found" : emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


// "use client"

// import type React from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Edit, Trash2, Eye } from "lucide-react"
// import { formatCurrency } from "@/lib/utils"

// interface Column {
//   key: string
//   label: string
//   type?: "text" | "number" | "currency" | "badge" | "image" | "date" | "status"
//   render?: (value: any, row: any) => React.ReactNode
//   className?: string
// }

// interface DataTableProps {
//   data: any[]
//   columns: Column[]
//   loading?: boolean
//   onEdit?: (item: any) => void
//   onDelete?: (id: string) => void
//   onView?: (item: any) => void
//   idField?: string
//   imageField?: string
//   nameField?: string
//   actions?: boolean
// }

// export function DataTable({
//   data,
//   columns,
//   loading = false,
//   onEdit,
//   onDelete,
//   onView,
//   idField = "id",
//   imageField = "picture",
//   nameField = "name",
//   actions = true,
// }: DataTableProps) {
//   const renderCell = (column: Column, value: any, row: any) => {
//     if (column.render) {
//       return column.render(value, row)
//     }

//     switch (column.type) {
//       case "currency":
//         return formatCurrency(value || 0)

//       case "badge":
//         const badgeVariant =
//           value === "active"
//             ? "default"
//             : value === "inactive"
//               ? "secondary"
//               : typeof value === "number"
//                 ? value < 10
//                   ? "destructive"
//                   : value < 50
//                     ? "secondary"
//                     : "default"
//                 : "default"
//         return <Badge variant={badgeVariant}>{value}</Badge>

//       case "image":
//         return (
//           <div className="flex items-center gap-3">
//             {row[imageField] ? (
//               <img
//                 src={row[imageField] || "/placeholder.svg"}
//                 alt={row[nameField] || "Image"}
//                 className="h-16 w-16 rounded-md object-cover"
//               />
//             ) : (
//               <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
//                 <Eye className="h-8 w-8 text-muted-foreground" />
//               </div>
//             )}
//             <div>
//               <div className="font-medium">{row[nameField]}</div>
//               {row.code && <div className="text-sm text-muted-foreground">{row.code}</div>}
//             </div>
//           </div>
//         )

//       case "date":
//         return value ? new Date(value).toLocaleDateString() : "-"

//       case "number":
//         return typeof value === "number" ? value.toLocaleString() : value || "-"

//       default:
//         return value || "-"
//     }
//   }

//   if (loading) {
//     return (
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               {columns.map((column) => (
//                 <TableHead key={column.key} className={column.className}>
//                   {column.label}
//                 </TableHead>
//               ))}
//               {actions && <TableHead className="text-right">Actions</TableHead>}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {Array.from({ length: 5 }).map((_, i) => (
//               <TableRow key={i}>
//                 {columns.map((column) => (
//                   <TableCell key={column.key}>
//                     {column.type === "image" ? (
//                       <div className="flex items-center gap-3">
//                         <div className="h-16 w-16 rounded-md bg-muted animate-pulse" />
//                         <div className="space-y-2">
//                           <div className="h-4 w-32 bg-muted animate-pulse rounded" />
//                           <div className="h-3 w-24 bg-muted animate-pulse rounded" />
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="h-4 w-20 bg-muted animate-pulse rounded" />
//                     )}
//                   </TableCell>
//                 ))}
//                 {actions && (
//                   <TableCell>
//                     <div className="h-8 w-20 bg-muted animate-pulse rounded" />
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             {columns.map((column) => (
//               <TableHead key={column.key} className={column.className}>
//                 {column.label}
//               </TableHead>
//             ))}
//             {actions && <TableHead className="text-right">Actions</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {data.length > 0 ? (
//             data.map((row, index) => (
//               <TableRow key={row[idField] || index} className="group">
//                 {columns.map((column) => (
//                   <TableCell key={column.key} className={column.className}>
//                     {renderCell(column, row[column.key], row)}
//                   </TableCell>
//                 ))}
//                 {actions && (
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       {onView && (
//                         <Button variant="ghost" size="sm" onClick={() => onView(row)}>
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                       )}
//                       {onEdit && (
//                         <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                       )}
//                       {onDelete && (
//                         <Button variant="ghost" size="sm" onClick={() => onDelete(row[idField])}>
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell
//                 colSpan={columns.length + (actions ? 1 : 0)}
//                 className="text-center py-8 text-muted-foreground"
//               >
//                 No data found
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }
