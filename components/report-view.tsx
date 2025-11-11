"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Calendar } from "lucide-react"

interface MonthlyRecord {
  _id: string
  month: number
  year: number
  passengerId: {
    _id: string
    name: string
    empid: string
    fee: number
    mobile: string
    endlocation: string
    duration: string
    department: {
      _id: string
      name: string
    }
  }
  selected: boolean
  createdAt: string
  updatedAt: string
}

export default function ReportView() {
  const [records, setRecords] = useState<MonthlyRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchData()
  }, [selectedMonth]) // ✅ Refetch when month changes

  const fetchData = async () => {
    setLoading(true)
    try {
      const [year, month] = selectedMonth.split('-')

      const response = await fetch(`/api/monthly-selection?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      const data = await response.json()
      console.log("API Response:", data)
      setRecords(data.records || [])
    } catch (err) {
      console.error("Fetch error:", err)
      setMessage("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Filter passengers by selected status
  const withSeason = records.filter((r) => r.selected)
  const withoutSeason = records.filter((r) => !r.selected)
  const totalPassengers = records.length

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const headers = ["Name", "Employee ID", "Department", "End-Location", "Season-Fee", "Duration", "Mobile", "Status"]
    const rows = records.map((r) => [
      r.passengerId.name,
      r.passengerId.empid,
      r.passengerId.department?.name || "N/A",
      r.passengerId.endlocation,
      r.passengerId.fee,
      r.passengerId.duration,
      r.passengerId.mobile,
      r.selected ? "WITH Season" : "WITHOUT Season",
    ])

    const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `season-report-${selectedMonth}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-8">Loading reports...</div>

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
      <div className="space-y-6">
        {message && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Report Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPassengers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">WITH Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{withSeason.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">WITHOUT Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{withoutSeason.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coverage %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalPassengers > 0 ? Math.round((withSeason.length / totalPassengers) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 flex-wrap print:hidden">
          <Button onClick={handlePrint} className="gap-2" variant="default">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
          <Button onClick={handleExportCSV} className="gap-2 bg-transparent" variant="outline">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* With Season */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="border-b border-green-200">
              <CardTitle className="text-green-700 flex items-center justify-between">
                <span>Passengers WITH Season</span>
                <Badge className="bg-green-600">{withSeason.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {withSeason.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No passengers selected for {monthName}</p>
              ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {withSeason.map((record, idx) => (
                        <div key={record._id} className="text-sm border-b pb-3 last:border-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {idx + 1}. {record.passengerId.name}
                              </p>
                              <div className="flex gap-2 flex-wrap mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {record.passengerId.empid}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {record.passengerId.department?.name || "N/A"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Mobile: {record.passengerId.mobile}
                              </p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Without Season */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="border-b border-red-200">
              <CardTitle className="text-red-700 flex items-center justify-between">
                <span>Passengers WITHOUT Season</span>
                <Badge className="bg-red-600">{withoutSeason.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {withoutSeason.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    All passengers have season for {monthName}
                  </p>
              ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {withoutSeason.map((record, idx) => (
                        <div key={record._id} className="text-sm border-b pb-3 last:border-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {idx + 1}. {record.passengerId.name}
                              </p>
                              <div className="flex gap-2 flex-wrap mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {record.passengerId.empid}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {record.passengerId.department?.name || "N/A"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Mobile: {record.passengerId.mobile}
                              </p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
}