"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Search } from "lucide-react"

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

export default function PassengerList() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [filteredPassengers, setFilteredPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPassengers()
  }, [])

  useEffect(() => {
    const filtered = passengers.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.empid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.mobile.includes(searchTerm),
    )
    setFilteredPassengers(filtered)
  }, [searchTerm, passengers])

  const fetchPassengers = async () => {
    try {
      const response = await fetch("/api/passengers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      console.log(data)
      if (!response.ok) {
        setError(data.message || "Failed to fetch passengers")
        return
      }

      setPassengers(data.passengers || [])
    } catch (err) {
      setError("An error occurred while fetching passengers")
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this passenger?")) return

    try {
      const response = await fetch(`/api/passengers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        setPassengers(passengers.filter((p) => p._id !== id))
      }
    } catch (err) {
      setError("Failed to delete passenger")
    }
  }

  if (loading) return <div className="text-center py-8">Loading passengers...</div>
  if (error)
    return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    )

  return (
      <div className="space-y-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(passengers.map((p) => p.empid)).size}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
              placeholder="Search by name, employee ID, NIC, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
          />
        </div>

        {filteredPassengers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {passengers.length === 0 ? "No passengers registered yet." : "No passengers match your search."}
            </p>
        ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Employee ID</th>
                  <th className="text-left py-3 px-4 font-medium">Mobile</th>
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-left py-3 px-4 font-medium">Season Fee</th>
                  <th className="text-left py-3 px-4 font-medium">End Location</th>
                  <th className="text-left py-3 px-4 font-medium">Duration</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredPassengers.map((passenger) => (
                    <tr key={passenger._id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{passenger.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{passenger.empid}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">{passenger.mobile}</td>
                      <td className="py-3 px-4">{passenger.department}</td>
                      <td className="py-3 px-4">{passenger.fee}</td>
                      <td className="py-3 px-4">{passenger.endlocation}</td>
                      <td className="py-3 px-4">{passenger.duration}</td>
                      <td className="py-3 px-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(passenger._id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}

        {passengers.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredPassengers.length} of {passengers.length} passengers
            </div>
        )}
      </div>
  )
}
