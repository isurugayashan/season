import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {Department} from "@/lib/Department";

export async function GET(request: NextRequest) {

  try {
    await connectDB()

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const departments = await Department.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error("Get department error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
