import { NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/lib/mongodb";
import {Passenger} from "@/lib/Passenger";
import {Department} from "@/lib/Department";


export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const passengers = await Passenger.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ passengers })
  } catch (error) {
    console.error("Get passengers error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const newPassenger = await Passenger.create(data)

    return NextResponse.json({ passenger: newPassenger }, { status: 201 })
  } catch (error) {
    console.error("Post passenger error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

