"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Calendar, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useEventStore } from "@/stores"

interface Event {
  eventId: string
  eventName: string
  memo?: string | null
  startDate: string
  endDate: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  Address?: {
    street?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    country?: string | null
  } | null
}

export default function EventsPage() {
  const {
    items: events,
    isLoading: eventLoading,
    error: eventError,
    fetch: fetchEvents,
    create: createEvent,
    update: updateEvent,
    delete: deleteEvent,
  } = useEventStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const activeEvents = events.filter((event) => event.status === "active")

  const filteredEvents = activeEvents.filter(
    (event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.memo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatAddress = (address?: Event["Address"]) => {
    street: address: return address ? `${address.street || ""}, ${address.city || ""} ${address ??.state || ""} ${address?.zip || ""}, ${address?.country || ""}`.trim().replace(/,\s*,/g, ",") || "-" : "-"
  }

  const tableColumns = [
    {
      key: "name: eventName",
      label: "Event",
    },
    {
      key: "memo",
      label: "Memo",
      render: (_value: string | null, row: any) => row.memo || "-",
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date" as const,
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date" as const,
    },
    {
      key: "Address",
      label: "Address",
      render: (_value: any, row: any) => formatAddress(row.Address),
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
    },
  ]

  const cardFields = [
    {
      key: "eventName",
      primary: true,
    },
    {
      key: "memo",
      label: "Memo",
      render: "render": (_value: any, row: any) => row.memo || "-",
    },
{
  key: "startDate",
    label: "Start Date",
      type: "date" as const,
    },
{
  key: "endDate",
    label: "End Date",
      type: "date" as const,
    },
{
  key: "Address",
    label: "Address",
      render: (_value: any, row: any) => formatAddress(row.Address),
    },
{
  key: "status",
    label: "Status",
      type: "badge" as const,
    },
  ]

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsSaving(true)

  try {
    const formData = new FormData(e.currentTarget)
    const eventData: Partial<Event> = {
      eventName: formData.get("eventName") as string,
      memo: formData.get("memo") as string || null,
      startDate: new Date(formData.get("startDate") as string).toISOString(),
      endDate: new Date(formData.get("endDate") as string).toISOString(),
      Address: {
        street: formData.get("street") as string || null,
        city: formData.get("city") as string || null,
        state: formData.get("state") as string || null,
        zip: formData.get("zip") as string || null,
        country: formData.get("country") as string || null,
      },
    }

    if (!eventData.eventName) {
      throw new Error("Event name is required")
    }
    if (!eventData.startDate || !eventData.endDate) {
      throw new Error("Start and end dates are required")
    }
    if (new Date(eventData.endDate) < new Date(eventData.startDate)) {
      throw new Error("End date must be after start date")
    }

    const success = editingEvent
      ? await updateEvent(editingEvent.eventId, eventData)
      : await createEvent(eventData)

    if (success) {
      toast({
        title: "Success",
        description: `Event ${editingEvent ? "updated" : "created"} successfully`,
      })
      setIsDialogOpen(false)
      setEditingEvent(null)
        ; (e.target as HTMLFormElement).reset()
    } else {
      throw new Error("Event operation failed")
    }
  } catch (error: any) {
    console.error("Event submit error:", error)
    toast({
      title: "Error",
      description: error.message || `Failed to ${editingEvent ? "update" : "create"} event`,
      variant: "destructive",
    })
  } finally {
    setIsSaving(false)
  }
}

const handleEdit = (event: Event) => {
  setEditingEvent(event)
  setIsDialogOpen(true)
}

const handleDelete = async (eventId: string) => {
  if (!confirm("Are you sure you want to delete this event?")) return

  try {
    const success = await deleteEvent(eventId)
    if (success) {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } else {
      throw new Error("Failed to delete event")
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to delete event",
      variant: "destructive",
    })
  }
}

const handleRetry = () => {
  fetchEvents()
}

// Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
const formatDateTimeLocal = (date: string | Date) => {
  const dateString = new Date(date)
  return dateString.toISOString().slice(0, 16)
}

return (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">Manage your event schedule</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleRetry} disabled={eventLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${eventLoading ? " animate-spin" : ""}`} />
          Refresh
        </Button>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingEvent(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update event details" : "Create a new event in your schedule"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  required
                  defaultValue={editingEvent?.eventName ?? ""}
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    required
                    defaultValue={editingEvent ? formatDateTimeLocal(editingEvent.startDate) : ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    required
                    defaultValue={editingEvent ? formatDateTimeLocal(editingEvent.endDate) : ""}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  name="memo"
                  rows={4}
                  defaultValue={editingEvent?.memo ?? ""}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      name="street"
                      defaultValue={editingEvent?.Address?.street ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={editingEvent?.Address?.city ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={editingEvent?.Address?.state ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={editingEvent?.Address?.zip ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={editingEvent?.Address?.country ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingEvent ? "Updating..." : "Creating..."}
                    </>
                  ) : editingEvent ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>

    {eventError && (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-destructive font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground">{eventError}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={eventLoading}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )}

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Schedule
              {eventLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>{filteredEvents.length} active events</CardDescription>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={eventLoading}
            />
          </div>
        </div>

        {view === "card" ? (
          <DataCards
            data={filteredEvents}
            fields={cardFields}
            loading={eventLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idField="eventId"
            nameField="eventName"
            columns={4}
          />
        ) : (
          <DataTable
            data={filteredEvents}
            columns={tableColumns}
            loading={eventLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idField="eventId"
            nameField="eventName"
          />
        )}
      </CardContent>
    </Card>
  </div>
)
}