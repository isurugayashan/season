"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Circle } from "lucide-react"

interface Passenger {
  _id: string
  name: string
  empid: string
  department: string
  fee: number
  mobile: string
  endlocation: string
  duration: string
}

export default function MonthlySelection() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedPassengers, setSelectedPassengers] = useState<Set<string>>(new Set())
  const [selectedMonth, setSelectedMonth] = useState('') // ✅ Keep this as is
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeason, setFilterSeason] = useState("")

  useEffect(() => {
    fetchPassengers()
  }, [])

  const fetchPassengers = async () => {
    try {
      const response = await fetch("/api/passengers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      setPassengers(data.passengers || [])
    } catch (err) {
      setMessage("Failed to fetch passengers")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedPassengers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPassengers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPassengers.size === filteredPassengers.length) {
      setSelectedPassengers(new Set())
    } else {
      setSelectedPassengers(new Set(filteredPassengers.map((p) => p._id)))
    }
  }

  const handleSave = async () => {
    // ✅ Validate month selection first
    if (!selectedMonth || selectedMonth.trim() === '') {
      setMessage("Please select a month")
      setMessageType("error")
      return
    }

    if (selectedPassengers.size === 0) {
      setMessage("Please select at least one passenger")
      setMessageType("error")
      return
    }

    setSaving(true)
    setMessage("")

    try {
      // ✅ Better error handling for split
      const monthParts = selectedMonth.split('-')
      if (monthParts.length !== 2) {
        throw new Error("Invalid month format")
      }

      const [year, month] = monthParts

      console.log("Submitting:", { month, year, count: selectedPassengers.size })

      const passengerSelections = passengers.map((p) => ({
        passengerId: p._id,
        selected: selectedPassengers.has(p._id),
      }))

      const response = await fetch("/api/monthly-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          month,
          year,
          selections: passengerSelections, // ✅ send all passengers
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Failed to save selection")
        setMessageType("error")
        return
      }

      setMessage(`Monthly selection saved successfully for ${year}-${month}!`)
      setMessageType("success")
      setSelectedPassengers(new Set())
      setSelectedMonth('') // ✅ Reset month selection
    } catch (err) {
      console.error("Save error:", err)
      setMessage(err instanceof Error ? err.message : "An error occurred while saving")
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  // const uniqueSeasons = Array.from(new Set(passengers.map((p) => p.seasonId)))

  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.empid.toLowerCase().includes(searchTerm.toLowerCase())
    // const matchesSeason = !filterSeason || p.seasonId === filterSeason
    return matchesSearch
  })

  if (loading) return <div className="text-center py-8">Loading passengers...</div>

  return (
      <div className="space-y-6">
        {message && (
            <Alert variant={messageType === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passengers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{selectedPassengers.size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Selection %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {passengers.length > 0 ? Math.round((selectedPassengers.size / passengers.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
            />
            {/* ✅ Display selected month */}
            {selectedMonth && (
                <p className="text-sm text-muted-foreground">
                  Selected: {new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
                </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Select Passengers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search by name or employee ID</label>
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="gap-2 bg-transparent">
                  {selectedPassengers.size === filteredPassengers.length ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Deselect All
                      </>
                  ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        Select All
                      </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                {filteredPassengers.length} passenger{filteredPassengers.length !== 1 ? "s" : ""}
              </span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-4 bg-muted/30">
              {filteredPassengers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No passengers match your filters</p>
              ) : (
                  filteredPassengers.map((passenger) => (
                      <label
                          key={passenger._id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                            checked={selectedPassengers.has(passenger._id)}
                            onCheckedChange={() => handleToggle(passenger._id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{passenger.name}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {passenger.empid}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {passenger.department}
                            </Badge>
                          </div>
                        </div>
                      </label>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Button
            onClick={handleSave}
            disabled={saving || !selectedMonth}
            className="w-full"
            size="lg"
        >
          {saving ? "Saving..." : `Save Selection (${selectedPassengers.size} selected)`}
        </Button>
      </div>
  )
}