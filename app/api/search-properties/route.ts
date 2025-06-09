import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Property } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received search request")

    const criteria = await request.json()
    console.log("API: Parsed criteria:", criteria)

    // Validate required fields
    if (!criteria.neighborhoods || criteria.neighborhoods.length === 0) {
      console.log("API: No neighborhoods selected")
      return NextResponse.json({ error: "At least one neighborhood must be selected" }, { status: 400 })
    }

    if (!criteria.timeRange) {
      console.log("API: No time range selected")
      return NextResponse.json({ error: "Time range is required" }, { status: 400 })
    }

    console.log("API: Starting property search with Supabase...")

    // Crear trabajo de scraping
    const { data: job, error: jobError } = await supabaseAdmin
      .from("scraping_jobs")
      .insert({
        status: "processing",
        criteria,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      console.error("Error creating scraping job:", jobError)
      throw jobError
    }

    console.log(`📝 Created scraping job: ${job.id}`)

    // Simular tiempo de scraping
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Obtener propiedades existentes con filtros
    let query = supabaseAdmin.from("properties").select("*").order("created_at", { ascending: false })

    // Aplicar filtros
    if (criteria.neighborhoods && criteria.neighborhoods.length > 0) {
      query = query.in("neighborhood", criteria.neighborhoods)
    }

    if (criteria.ownerOnly) {
      query = query.eq("is_owner", true)
    }

    if (criteria.maxPricePerM2) {
      query = query.lte("price_per_m2", criteria.maxPricePerM2 * 1.1)
    }

    // Filtrar por fecha si se especifica
    if (criteria.timeRange && criteria.timeRange !== "custom") {
      const now = new Date()
      const startDate = new Date()

      switch (criteria.timeRange) {
        case "24h":
          startDate.setDate(now.getDate() - 1)
          break
        case "3d":
          startDate.setDate(now.getDate() - 3)
          break
        case "7d":
          startDate.setDate(now.getDate() - 7)
          break
      }

      query = query.gte("published_date", startDate.toISOString())
    }

    const { data: properties, error: queryError } = await query.limit(50)

    if (queryError) {
      console.error("Error fetching properties:", queryError)
      throw queryError
    }

    // Si no hay suficientes propiedades, generar algunas nuevas
    const finalProperties = properties || []

    if (finalProperties.length < 5) {
      console.log("API: Generating additional properties...")
      const newProperties = await generateAdditionalProperties(criteria)

      // Guardar nuevas propiedades
      for (const property of newProperties) {
        const { data, error } = await supabaseAdmin
          .from("properties")
          .upsert(property, { onConflict: "id" })
          .select()
          .single()

        if (!error && data) {
          finalProperties.push(data)
        }
      }
    }

    // Actualizar trabajo como completado
    await supabaseAdmin
      .from("scraping_jobs")
      .update({
        status: "completed",
        result: { properties: finalProperties.map((p) => p.id) },
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)

    console.log(`API: Found ${finalProperties.length} properties`)

    return NextResponse.json({
      properties: finalProperties,
      count: finalProperties.length,
      criteria,
      timestamp: new Date().toISOString(),
      source: "supabase",
      jobId: job.id,
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

async function generateAdditionalProperties(criteria: any): Promise<Property[]> {
  const { neighborhoods = [] } = criteria

  // Templates de propiedades para generar
  const propertyTemplates = [
    {
      title: "Departamento 2 ambientes en Palermo Hollywood con balcón",
      link: "https://www.zonaprop.com.ar/propiedades/departamento-2-ambientes-en-palermo-hollywood-con-balcon-49693234.html",
      total_price: 180000,
      surface: 65,
      source: "Zonaprop",
      neighborhood: "Palermo",
      is_owner: true,
    },
    {
      title: "Monoambiente a estrenar en Palermo Soho",
      link: "https://www.zonaprop.com.ar/propiedades/monoambiente-a-estrenar-en-palermo-soho-49125678.html",
      total_price: 120000,
      surface: 40,
      source: "Zonaprop",
      neighborhood: "Palermo",
      is_owner: false,
    },
    {
      title: "Departamento 2 ambientes en Belgrano R",
      link: "https://www.argenprop.com/departamento-en-venta-en-belgrano-2-ambientes--9765432",
      total_price: 145000,
      surface: 55,
      source: "Argenprop",
      neighborhood: "Belgrano",
      is_owner: true,
    },
    {
      title: "3 ambientes en Recoleta con cochera",
      link: "https://www.zonaprop.com.ar/propiedades/3-ambientes-en-recoleta-con-cochera-49234567.html",
      total_price: 250000,
      surface: 85,
      source: "Zonaprop",
      neighborhood: "Recoleta",
      is_owner: true,
    },
    {
      title: "Departamento en Villa Crespo con terraza",
      link: "https://www.zonaprop.com.ar/propiedades/departamento-en-villa-crespo-con-terraza-48765432.html",
      total_price: 145000,
      surface: 58,
      source: "Zonaprop",
      neighborhood: "Villa Crespo",
      is_owner: false,
    },
  ]

  // Filtrar por barrios seleccionados
  let filtered = propertyTemplates
  if (neighborhoods.length > 0) {
    filtered = propertyTemplates.filter((property) =>
      neighborhoods.some((n: string) => property.neighborhood.toLowerCase() === n.toLowerCase()),
    )
  }

  // Generar propiedades con IDs únicos y variaciones
  const properties: Property[] = []

  for (let i = 0; i < Math.min(filtered.length, 8); i++) {
    const template = filtered[i % filtered.length]

    // Añadir variación en precios (±15%)
    const priceVariation = 0.85 + Math.random() * 0.3
    const total_price = Math.round(template.total_price * priceVariation)
    const price_per_m2 = Math.round(total_price / template.surface)

    const property: Property = {
      id: `generated-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      link: template.link,
      total_price,
      surface: template.surface,
      price_per_m2,
      source: template.source as any,
      neighborhood: template.neighborhood,
      is_owner: template.is_owner,
      published_date: new Date().toISOString(),
    }

    properties.push(property)
  }

  return properties
}
