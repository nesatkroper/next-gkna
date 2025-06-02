"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Search, Download, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AuthLog {
  id: number
  authId: string
  method: string
  url: string
  status: number
  responseTime: number
  ip: string
  userAgent: string | null
  createdAt: string
  Auth: {
    email: string
    Role: {
      name: string
    }
  }
}

interface SecurityLogsResponse {
  logs: AuthLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AuthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    ip: "",
    startDate: "",
    endDate: "",
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      })

      const response = await fetch(`/api/auth/security-logs?${params}`)
      if (response.ok) {
        const data: SecurityLogsResponse = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, pagination.limit])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      )
    } else if (status >= 400 && status < 500) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Client Error
        </Badge>
      )
    } else if (status >= 500) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Server Error
        </Badge>
      )
    }
    return <Badge variant="secondary">Unknown</Badge>
  }

  const getMethodBadge = (method: string) => {
    if (method === "SECURITY_EVENT") {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Security Event
        </Badge>
      )
    }
    return <Badge variant="outline">{method}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Security Logs</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter security logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status Code</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="200">200 (Success)</SelectItem>
                  <SelectItem value="401">401 (Unauthorized)</SelectItem>
                  <SelectItem value="403">403 (Forbidden)</SelectItem>
                  <SelectItem value="429">429 (Rate Limited)</SelectItem>
                  <SelectItem value="500">500 (Server Error)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="Filter by IP"
                value={filters.ip}
                onChange={(e) => handleFilterChange("ip", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ status: "", ip: "", startDate: "", endDate: "" })
                setPagination((prev) => ({ ...prev, page: 1 }))
                fetchLogs()
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Authentication Logs</CardTitle>
              <CardDescription>
                Showing {logs.length} of {pagination.total} logs
              </CardDescription>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>URL/Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.Auth.email}</div>
                          <div className="text-sm text-muted-foreground">{log.Auth.Role.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getMethodBadge(log.method)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.url}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                      <TableCell>{log.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
