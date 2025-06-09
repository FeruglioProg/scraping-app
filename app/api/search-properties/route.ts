import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-safe"
import type { Property } from "@/lib/types"

// Fallback data for when Supabase is not configured
const fallbackProperties: Property[] = [
  {
    id: "fallback-1",
    title: "Departamento 2 ambientes en Palermo Hollywood",
    link: "https://www.zonaprop.com.ar/ejemplo-1",
    total_price: 180000,
    surface: 65,
    price_per_m2: 2769,
    source: "Zonaprop",
    neighborhood: "Palermo",
    is_owner: true,
    published_date: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    title: "Monoambiente luminoso en Belgrano",
    link: "https://www.argenprop.com/ejemplo-2",
    total_price: 120000,
    surface: 45,
    price_per_m2: 2667,
    source: "Argenprop",
    neighborhood: "Belgrano",
    is_owner: false,
    published_date: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    title: "Departamento de categoría en Recoleta",
    link: "https://inmuebles.mercadolibre.com.ar/ejemplo-3",
    total_price: 250000,
    surface: 85,
    price_per_m2: 2941,
    source: "MercadoLibre",
    neighborhood: "Recoleta",
    is_owner: true,
    published_date: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    title: "Loft en San Telmo histórico",
    link: "https://www.zonaprop.com.ar/ejemplo-4",
    total_price: 140000,
    surface: 55,
    price_per_m2: 2545,
    source: "Zonaprop",
    neighborhood: "San Telmo",
    is_owner: true,
    published_date: new Date().toISOString(),
  },
  {
    id: "fallback-5",
    title: "Departamento en Villa Crespo con terraza",
    link: "https://www.argenprop.com/ejemplo-5",
    total_price: 155000,
    surface: 60,
    price_per_m2: 2583,
    source: "Argenprop",
    neighborhood: "Villa Crespo",
    is_owner: false,
    published_date: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received search request")

    const criteria = await request.json()
    console.log("API: Parsed criteria:", criteria)

    // Validate required fields
    if (!criteria.neighborhoods || criteria.neighborhoods.length === 0) {
      return NextResponse.json({ error: "At least one neighborhood must be selected" }, { status: 400 })
    }

    if (!criteria.timeRange) {
      return NextResponse.json({ error: "Time range is required" }, { status: 400 })
    }

    let properties: Property[] = []
    let source = "fallback"

    // Try to use Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        console.log("API: Using Supabase for search...")

        let query = supabaseAdmin.from("properties").select("*").order("created_at", { ascending: false })

        // Apply filters
        if (criteria.neighborhoods && criteria.neighborhoods.length > 0) {
          query = query.in("neighborhood", criteria.neighborhoods)
        }

        if (criteria.ownerOnly) {
          query = query.eq("is_owner", true)
        }

        if (criteria.maxPricePerM2) {
          query = query.lte("price_per_m2", criteria.maxPricePerM2 * 1.1)
        }

        const { data, error } = await query.limit(50)

        if (error) {
          console.error("Supabase query error:", error)
          throw error
        }

        properties = data || []
        source = "supabase"

        console.log(`API: Found ${properties.length} properties from Supabase`)
      } catch (supabaseError) {
        console.error("Supabase error, falling back to mock data:", supabaseError)
        properties = applyFiltersToFallbackData(fallbackProperties, criteria)
        source = "fallback-after-error"
      }
    } else {
      console.log("API: Supabase not configured, using fallback data")
      properties = applyFiltersToFallbackData(fallbackProperties, criteria)
    }

    // If no properties found, generate some based on criteria
    if (properties.length === 0) {
      properties = generatePropertiesForCriteria(criteria)
      source = "generated"
    }

    console.log(`API: Returning ${properties.length} properties from ${source}`)

    return NextResponse.json({
      properties,
      count: properties.length,
      criteria,
      source,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API: Search error:", error)

    return NextResponse.json(
      {
        error: "Failed to search properties",
        details: error instanceof Error ? error.message : "Unknown error",
        properties: applyFiltersToFallbackData(fallbackProperties, {}),
        count: 0,
        source: "error-fallback",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function applyFiltersToFallbackData(properties: Property[], criteria: any): Property[] {
  let filtered = [...properties]

  // Filter by neighborhoods
  if (criteria.neighborhoods && criteria.neighborhoods.length > 0) {
    filtered = filtered.filter((property) =>
      criteria.neighborhoods.some((n: string) => property.neighborhood.toLowerCase() === n.toLowerCase()),
    )
  }

  // Filter by owner
  if (criteria.ownerOnly) {
    filtered = filtered.filter((property) => property.is_owner)
  }

  // Filter by price per m²
  if (criteria.maxPricePerM2 && criteria.maxPricePerM2 > 0) {
    filtered = filtered.filter((property) => property.price_per_m2 <= criteria.maxPricePerM2 * 1.1)
  }

  return filtered
}

function generatePropertiesForCriteria(criteria: any): Property[] {
  const neighborhoods = criteria.neighborhoods || ["Palermo"]
  const properties: Property[] = []

  neighborhoods.forEach((neighborhood: string, index: number) => {
    const basePrice = 120000 + Math.random() * 100000
    const surface = 40 + Math.random() * 60
    const pricePerM2 = Math.round(basePrice / surface)

    properties.push({
      id: `generated-${Date.now()}-${index}`,
      title: `Departamento en ${neighborhood} - ${Math.floor(surface)}m²`,
      link: `https://www.zonaprop.com.ar/generated-${index}`,
      total_price: Math.round(basePrice),
      surface: Math.round(surface),
      price_per_m2: pricePerM2,
      source: "Zonaprop",
      neighborhood,
      is_owner: Math.random() > 0.5,
      published_date: new Date().toISOString(),
    })
  })

  return properties
}
