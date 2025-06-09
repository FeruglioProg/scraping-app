import { type NextRequest, NextResponse } from "next/server"
import { searchProperties } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const criteria = await request.json()

    // Validate required fields
    if (!criteria.neighborhoods || criteria.neighborhoods.length === 0) {
      return NextResponse.json({ error: "At least one neighborhood must be selected" }, { status: 400 })
    }

    if (!criteria.timeRange) {
      return NextResponse.json({ error: "Time range is required" }, { status: 400 })
    }

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const properties = searchProperties(criteria)

    return NextResponse.json({
      properties,
      count: properties.length,
      criteria,
      timestamp: new Date().toISOString(),
      source: "mock-data",
    })
  } catch (error) {
    console.error("API: Search error:", error)

    return NextResponse.json(
      {
        error: "Failed to search properties",
        details: error instanceof Error ? error.message : "Unknown error",
        properties: [],
        count: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
