import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"
import {MonthlySelection} from "@/lib/MonthlySelection";

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const query: any = {}
    if (month) query.month = Number.parseInt(month)
    if (year) query.year = Number.parseInt(year)

    // ✅ Nested populate to get department details inside passenger
    const records = await MonthlySelection.find(query)
        .populate({
          path: "passengerId",
          populate: {
            path: "department", // ✅ department field inside passenger
            model: "Department", // ✅ explicitly define model
            select: "name",
          },
        })

        .sort({ createdAt: -1 })

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Get monthly selections error:", error)
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

    const { month, year, selections } = await request.json()

    if (
        !month ||
        !year ||
        !Array.isArray(selections) ||
        selections.some((s) => !s.passengerId)
    ) {
      return NextResponse.json({ message: "Missing or invalid fields" }, { status: 400 })
    }

    // ✅ Prepare bulk operations for efficiency
    const bulkOps = selections.map((sel: { passengerId: string; selected: boolean }) => ({
      updateOne: {
        filter: {
          month,
          year,
          passengerId: new mongoose.Types.ObjectId(sel.passengerId),
        },
        update: {
          $set: { selected: sel.selected },
        },
        upsert: true, // ✅ Create if not exists
      },
    }))

    // Execute all updates in one go
    await MonthlySelection.bulkWrite(bulkOps)

    return NextResponse.json({ message: "Monthly selections saved successfully" }, { status: 201 })
  } catch (error) {
    console.error("Create monthly selections error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

