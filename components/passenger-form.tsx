"use client"

import React, {useEffect} from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export default function PassengerForm() {
  const [formData, setFormData] = useState({
    empid: "",
    department: "",
    mobile: "",
    name: "",
    fee: "",
    endlocation: "",
    duration: ""
  })

  interface Department {
    _id: string
    name: string
  }

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    fetchDepartments()
  }, [])


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
        setError(data.message || "Failed to fetch passengers")
        return
      }

      setDepartments(data.departments || [])
    } catch (err) {
      setError("An error occurred while fetching passengers")
    } finally {
      setLoading(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/passengers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Failed to add passenger")
        setMessageType("error")
        return
      }

      setMessage("Passenger added successfully!")
      setMessageType("success")
      setFormData({ empid: "", department: "", mobile: "", name: "", endlocation: "", duration: "", fee: "" })
    } catch (err) {
      setMessage("An error occurred. Please try again.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
            <Alert variant={messageType === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
                type="text"
                name="name"
                placeholder="Passenger Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employee ID</label>
            <Input
                type="text"
                name="empid"
                placeholder="EMP001"
                value={formData.empid}
                onChange={handleChange}
                required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select
                value={formData.department}
                onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, department: value }))
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
            <label className="text-sm font-medium">Mobile Number</label>
            <Input
                type="tel"
                name="mobile"
                placeholder="+94712345678"
                value={formData.mobile}
                onChange={handleChange}
                required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Season Fee</label>
            <Input
                type="number"
                name="fee"
                placeholder="+94712345678"
                value={formData.fee}
                onChange={handleChange}
                required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <Input
                type="text"
                name="duration"
                placeholder="3"
                value={formData.duration}
                onChange={handleChange}
                required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Location</label>
            <Input
                type="text"
                name="endlocation"
                placeholder="Maharagama"
                value={formData.endlocation}
                onChange={handleChange}
                required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Passenger"}
        </Button>
      </form>
  )
}
