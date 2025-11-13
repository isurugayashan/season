"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {Trash2, Search, Edit2, Trash} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleLeft, ToggleRight } from "lucide-react";

interface Passenger {
  _id: string
  name: string
  empid: string
  department: {
    _id: string
    name: string
  }
  fee: number
  mobile: string
  endlocation: string
  duration: string
}

interface EditPassengerForm {
  _id?: string
  name?: string
  empid?: string
  department?: string // Just the ID for editing
  fee?: number
  mobile?: string
  endlocation?: string
  duration?: string
}

interface Department {
  _id: string
  name: string
}

export default function PassengerList() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const isAdmin = role === "admin"

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [filteredPassengers, setFilteredPassengers] = useState<Passenger[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditPassengerForm>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPassengers()
    fetchDepartments()
  }, [])

  useEffect(() => {
    const filtered = passengers.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.empid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.mobile.includes(searchTerm)
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || "Failed to fetch departments")
        return
      }

      setDepartments(data.departments || [])
    } catch (err) {
      setError("An error occurred while fetching departments")
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

  const handleEdit = (passenger: Passenger) => {
    setEditingId(passenger._id)
    setEditFormData({
      ...passenger,
      department: passenger.department._id, // Store only the ID for the form
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/passengers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        const data = await response.json()
        setPassengers(passengers.map((p) => (p._id === editingId ? data.passenger : p)))
        setIsDialogOpen(false)
        setEditingId(null)
      }
    } catch (err) {
      setError("Failed to update passenger")
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
              placeholder="Search by name, employee ID, or mobile..."
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
                  {isAdmin && <th className="text-left py-3 px-4 font-medium">Action</th>}
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
                      <td className="py-3 px-4">{passenger.department.name}</td>
                      <td className="py-3 px-4">{passenger.fee}</td>
                      <td className="py-3 px-4">{passenger.endlocation}</td>
                      <td className="py-3 px-4">{passenger.duration} Years</td>
                      {isAdmin && (
                          <td className="py-3 px-4 flex gap-2">
                            <Dialog open={isDialogOpen && editingId === passenger._id} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(passenger)}
                                    className="text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Passenger</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        placeholder="Name"
                                        value={editFormData.name || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Employee ID</label>
                                    <Input
                                        placeholder="Employee ID"
                                        value={editFormData.empid || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, empid: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <Select
                                        value={editFormData.department || ""}
                                        onValueChange={(value) =>
                                            setEditFormData({ ...editFormData, department: value })
                                        }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select department" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept._id} value={dept._id}>
                                              {dept.name}
                                            </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile</label>
                                    <Input
                                        placeholder="Mobile"
                                        value={editFormData.mobile || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Duration (Years)</label>
                                    <Input
                                        placeholder="Duration"
                                        value={editFormData.duration || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">End Location</label>
                                    <Input
                                        placeholder="End Location"
                                        value={editFormData.endlocation || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, endlocation: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Season Fee (LKR)</label>
                                    <Input
                                        placeholder="Fee"
                                        type="number"
                                        value={editFormData.fee || ""}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, fee: Number.parseFloat(e.target.value) })
                                        }
                                    />
                                  </div>

                                  <Button onClick={handleSave} className="w-full">
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(passenger._id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <ToggleLeft className="w-4 h-4" />
                            </Button>
                          </td>
                      )}
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