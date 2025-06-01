"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface EnhancedTableProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
}

interface EnhancedTableRowProps {
  children: React.ReactNode
  className?: string
}

interface EnhancedTableCellProps {
  children: React.ReactNode
  className?: string
}

export function EnhancedTable({ children, loading, className }: EnhancedTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>{children}</Table>
    </div>
  )
}

export function EnhancedTableRow({ children, className }: EnhancedTableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("group hover:bg-muted/50 transition-colors", className)}
    >
      {children}
    </motion.tr>
  )
}

export function EnhancedTableCell({ children, className }: EnhancedTableCellProps) {
  return <TableCell className={cn("py-4", className)}>{children}</TableCell>
}
