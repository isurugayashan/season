import { type NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/lib/mongodb";
import {Passenger} from "@/lib/models/Passenger";
import mongoose from "mongoose"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    await connectDB()

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid passenger ID" }, { status: 400 })
    }

    const result = await Passenger.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ message: "Passenger not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Passenger deleted" })

  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params  // Add await here
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid passenger ID" }, { status: 400 })
    }

    const updatedPassenger = await Passenger.findByIdAndUpdate(id, body, { new: true }).populate("department")

    if (!updatedPassenger) {
      return NextResponse.json({ message: "Passenger not found" }, { status: 404 })
    }

    return NextResponse.json({ passenger: updatedPassenger })
  } catch (error) {
    console.error("Update passenger error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}