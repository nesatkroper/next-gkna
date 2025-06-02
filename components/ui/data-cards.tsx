"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Eye, Search, Plus, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export type CardFieldType = {
  key: string
  label?: string
  type?: "text" | "number" | "date" | "currency" | "badge" | "image" | "boolean" | "custom"
  primary?: boolean
  secondary?: boolean
  format?: (value: any) => string
  render?: (value: any, item: any) => React.ReactNode
  badgeVariant?: Record<string, string>
}

interface DataCardsProps<T> {
  data: T[]
  fields: CardFieldType[]
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
  columns?: 1 | 2 | 3 | 4 | 5 | 6
}

export function DataCards<T>({
  data,
  fields,
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
  columns = 3,
}: DataCardsProps<T>) {
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

  const imageField = fields.find((field) => field.type === "image")
  const primaryField = fields.find((field) => field.primary)
  const secondaryField = fields.find((field) => field.secondary)
  const otherFields = fields.filter((field) => !field.primary && !field.secondary && field.type !== "image")

  const renderField = (item: T, field: CardFieldType) => {
    const value = (item as Record<string, any>)[field.key]

    if (field.render) {
      return field.render(value, item)
    }

    switch (field.type) {
      case "image":
        return null // Handled separately
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
        const variant = field.badgeVariant?.[value] || "default"
        return <Badge variant={variant as any}>{value}</Badge>
      case "boolean":
        return value ? "Yes" : "No"
      default:
        return field.format ? field.format(value) : value
    }
  }

  const renderSkeleton = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="overflow-hidden">
        <div className="aspect-square bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </CardFooter>
      </Card>
    ))
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
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

      {isLoading ? (
        <div className={cn("grid gap-4", gridCols[columns])}>{renderSkeleton()}</div>
      ) : filteredData.length > 0 ? (
        <div className={cn("grid gap-4", gridCols[columns])}>
          {filteredData.map((item) => {
            const id = (item as Record<string, any>)[idField]
            const imageValue = imageField ? (item as Record<string, any>)[imageField.key] : null
            const primaryValue = primaryField ? (item as Record<string, any>)[primaryField.key] : null
            const secondaryValue = secondaryField ? (item as Record<string, any>)[secondaryField.key] : null

            return (
              <Card key={id} className="overflow-hidden hover:shadow-md transition-shadow">
                {imageValue && (
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                      src={imageValue || "/placeholder.svg"}
                      alt={primaryValue ? String(primaryValue) : `Item ${id}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                  </div>
                )}
                <CardHeader className={cn("p-4", !imageValue && "pt-6")}>
                  {primaryValue && <h3 className="text-lg font-semibold truncate">{primaryValue}</h3>}
                  {secondaryValue && <p className="text-sm text-muted-foreground">{secondaryValue}</p>}
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {otherFields.map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{field.label || field.key}:</span>
                      <span className="text-sm font-medium">{renderField(item, field)}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
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
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
          <Search className="h-8 w-8 mb-2" />
          <p>{searchTerm ? "No results found" : emptyMessage}</p>
        </div>
      )}
    </div>
  )
}


// "use client"

// import type React from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Edit, Trash2, Eye } from "lucide-react"
// import { formatCurrency } from "@/lib/utils"

// interface CardField {
//   key: string
//   label?: string
//   type?: "text" | "number" | "currency" | "badge" | "image" | "date" | "status"
//   render?: (value: any, row: any) => React.ReactNode
//   primary?: boolean
//   secondary?: boolean
//   hidden?: boolean
// }

// interface DataCardsProps {
//   data: any[]
//   fields: CardField[]
//   loading?: boolean
//   onEdit?: (item: any) => void
//   onDelete?: (id: string) => void
//   onView?: (item: any) => void
//   idField?: string
//   imageField?: string
//   nameField?: string
//   actions?: boolean
//   columns?: number
// }

// export function DataCards({
//   data,
//   fields,
//   loading = false,
//   onEdit,
//   onDelete,
//   onView,
//   idField = "id",
//   imageField = "picture",
//   nameField = "name",
//   actions = true,
//   columns = 4,
// }: DataCardsProps) {
//   const gridCols = {
//     1: "grid-cols-1",
//     2: "grid-cols-1 sm:grid-cols-2",
//     3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
//     4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
//     5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
//     6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
//   }

//   const renderField = (field: CardField, value: any, row: any) => {
//     if (field.render) {
//       return field.render(value, row)
//     }

//     switch (field.type) {
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
//           <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
//             {row[imageField] ? (
//               <img
//                 src={row[imageField] || "/placeholder.svg"}
//                 alt={row[nameField] || "Image"}
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center">
//                 <Eye className="h-12 w-12 text-muted-foreground" />
//               </div>
//             )}
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
//       <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
//         {Array.from({ length: 8 }).map((_, i) => (
//           <Card key={i} className="animate-pulse">
//             <CardContent className="p-4">
//               <div className="aspect-square bg-muted rounded-lg mb-3" />
//               <div className="space-y-2">
//                 <div className="h-4 bg-muted rounded w-3/4" />
//                 <div className="h-3 bg-muted rounded w-1/2" />
//                 <div className="h-3 bg-muted rounded w-2/3" />
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
//       {data.map((row, index) => {
//         const imageField_obj = fields.find((f) => f.type === "image")
//         const primaryField = fields.find((f) => f.primary)
//         const secondaryField = fields.find((f) => f.secondary)

//         return (
//           <Card key={row[idField] || index} className="group hover:shadow-lg transition-shadow">
//             <CardContent className="p-4">
//               <div className="flex flex-col space-y-3">
//                 {/* Image */}
//                 {imageField_obj && (
//                   <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
//                     {row[imageField_obj.key] ? (
//                       <img
//                         src={row[imageField_obj.key] || "/placeholder.svg"}
//                         alt={row[nameField] || "Image"}
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <div className="flex h-full w-full items-center justify-center">
//                         <Eye className="h-12 w-12 text-muted-foreground" />
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Content */}
//                 <div className="space-y-2">
//                   {/* Primary field (title) */}
//                   {primaryField && (
//                     <div>
//                       <h3 className="font-semibold line-clamp-2">
//                         {renderField(primaryField, row[primaryField.key], row)}
//                       </h3>
//                     </div>
//                   )}

//                   {/* Secondary field (subtitle) */}
//                   {secondaryField && (
//                     <p className="text-sm text-muted-foreground">
//                       {renderField(secondaryField, row[secondaryField.key], row)}
//                     </p>
//                   )}

//                   {/* Other fields */}
//                   <div className="space-y-1">
//                     {fields
//                       .filter((f) => !f.primary && !f.secondary && !f.hidden && f.type !== "image")
//                       .map((field) => (
//                         <div key={field.key} className="flex justify-between text-sm">
//                           <span className="text-muted-foreground">{field.label || field.key}:</span>
//                           <span className="font-medium">{renderField(field, row[field.key], row)}</span>
//                         </div>
//                       ))}
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 {actions && (
//                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                     {onView && (
//                       <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(row)}>
//                         <Eye className="h-4 w-4 mr-1" />
//                         View
//                       </Button>
//                     )}
//                     {onEdit && (
//                       <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(row)}>
//                         <Edit className="h-4 w-4 mr-1" />
//                         Edit
//                       </Button>
//                     )}
//                     {onDelete && (
//                       <Button variant="outline" size="sm" className="flex-1" onClick={() => onDelete(row[idField])}>
//                         <Trash2 className="h-4 w-4 mr-1" />
//                         Delete
//                       </Button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )
//       })}
//     </div>
//   )
// }
