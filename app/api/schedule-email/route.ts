import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, scheduleTime, ...criteria } = data

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // For now, just return success (in a real app, you'd save this to a database)
    console.log("Scheduling email for:", email, "at", scheduleTime)
    console.log("Criteria:", criteria)

    return NextResponse.json({
      success: true,
      message: `Email scheduled successfully for ${scheduleTime}`,
      email,
      scheduleTime,
    })
  } catch (error) {
    console.error("Schedule email error:", error)
    return NextResponse.json({ error: "Failed to schedule email" }, { status: 500 })
  }
}
