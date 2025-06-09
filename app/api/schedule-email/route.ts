import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, scheduleTime } = data

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: `Email scheduled successfully for ${scheduleTime || "09:00"}`,
      email,
      scheduleTime: scheduleTime || "09:00",
    })
  } catch (error) {
    console.error("Schedule email error:", error)
    return NextResponse.json({ error: "Failed to schedule email" }, { status: 500 })
  }
}
