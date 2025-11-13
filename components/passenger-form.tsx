"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Validation rules
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
          return "Name must contain only letters and spaces (2-50 characters)"
        }
        break
      case "empid":
        if (!/^\d{1,3}$/.test(value)) {
          return "Employee ID must be 1-3 digits only"
        }
        break
      case "mobile":
        if (!/^0\d{9}$/.test(value)) {
          return "Mobile must start with 0 and contain exactly 10 digits"
        }
        break
      case "fee":
        if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
          return "Fee must be a positive number"
        }
        break
      case "duration":
        if (!/^[1-9]\d*$/.test(value) || parseInt(value) < 1 || parseInt(value) > 50) {
          return "Duration must be between 1 and 50 years"
        }
        break
      case "endlocation":
        if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
          return "Location must contain only letters and spaces (2-50 characters)"
        }
        break
      default:
        return ""
    }
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Special handling for mobile - only allow digits
    if (name === "mobile") {
      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: cleaned }))
        const errorMsg = validateField(name, cleaned)
        setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
      }
      return
    }

    // Special handling for empid - uppercase letters + digits only
    // Special handling for empid - digits only
    if (name === "empid") {
      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length <= 3) {
        setFormData((prev) => ({ ...prev, [name]: cleaned }))
        const errorMsg = validateField(name, cleaned)
        setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
      }
      return
    }

    // Special handling for name and endlocation - only letters and spaces
    if (name === "name" || name === "endlocation") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "")
      if (cleaned.length <= 50) {
        setFormData((prev) => ({ ...prev, [name]: cleaned }))
        const errorMsg = validateField(name, cleaned)
        setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
      }
      return
    }

    // Special handling for fee - only numbers and decimal point
    if (name === "fee") {
      if (/^\d*\.?\d{0,2}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }))
        const errorMsg = validateField(name, value)
        setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
      }
      return
    }

    // Special handling for duration - only positive integers
    if (name === "duration") {
      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length <= 2) {
        setFormData((prev) => ({ ...prev, [name]: cleaned }))
        const errorMsg = validateField(name, cleaned)
        setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
      }
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    const errorMsg = validateField(name, value)
    setValidationErrors((prev) => ({ ...prev, [name]: errorMsg }))
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
        setError(data.message || "Failed to fetch departments")
        return
      }

      setDepartments(data.departments || [])
    } catch (err) {
      setError("An error occurred while fetching departments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submission
    const errors: Record<string, string> = {}
    Object.keys(formData).forEach((key) => {
      if (key !== "department") {
        const errorMsg = validateField(key, formData[key as keyof typeof formData])
        if (errorMsg) {
          errors[key] = errorMsg
        }
      }
    })

    if (!formData.department) {
      errors.department = "Please select a department"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setMessage("Please fix all validation errors")
      setMessageType("error")
      return
    }

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
      setValidationErrors({})
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
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={validationErrors.name ? "border-red-500" : ""}
                required
            />
            {validationErrors.name && (
                <p className="text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serial Number</label>
            <Input
                type="text"
                name="empid"
                placeholder="EMP001"
                value={formData.empid}
                onChange={handleChange}
                className={validationErrors.empid ? "border-red-500" : ""}
                required
            />
            {validationErrors.empid && (
                <p className="text-xs text-red-500">{validationErrors.empid}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select
                value={formData.department}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, department: value }))
                  setValidationErrors((prev) => ({ ...prev, department: "" }))
                }}
            >
              <SelectTrigger className={`w-full ${validationErrors.department ? "border-red-500" : ""}`}>
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
            {validationErrors.department && (
                <p className="text-xs text-red-500">{validationErrors.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <Input
                type="tel"
                name="mobile"
                placeholder="0712345678"
                value={formData.mobile}
                onChange={handleChange}
                className={validationErrors.mobile ? "border-red-500" : ""}
                required
            />
            {validationErrors.mobile && (
                <p className="text-xs text-red-500">{validationErrors.mobile}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Season Fee (LKR)</label>
            <Input
                type="text"
                name="fee"
                placeholder="5120.00"
                value={formData.fee}
                onChange={handleChange}
                className={validationErrors.fee ? "border-red-500" : ""}
                required
            />
            {validationErrors.fee && (
                <p className="text-xs text-red-500">{validationErrors.fee}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (Years)</label>
            <Input
                type="text"
                name="duration"
                placeholder="3"
                value={formData.duration}
                onChange={handleChange}
                className={validationErrors.duration ? "border-red-500" : ""}
                required
            />
            {validationErrors.duration && (
                <p className="text-xs text-red-500">{validationErrors.duration}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Location</label>
            <Input
                type="text"
                name="endlocation"
                placeholder="Maharagama"
                value={formData.endlocation}
                onChange={handleChange}
                className={validationErrors.endlocation ? "border-red-500" : ""}
                required
            />
            {validationErrors.endlocation && (
                <p className="text-xs text-red-500">{validationErrors.endlocation}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Passenger"}
        </Button>
      </form>
  )
}