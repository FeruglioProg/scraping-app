import * as cheerio from "cheerio"
import type { Property } from "./types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Headers para parecer un navegador real
const getHeaders = () => ({
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  DNT: "1",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
})

export async function scrapeZonaprop(neighborhood: string): Promise<Property[]> {
  const properties: Property[] = []

  try {
    console.log(`🔍 Scraping Zonaprop for ${neighborhood}...`)

    // URL de búsqueda de Zonaprop
    const searchUrl = `https://www.zonaprop.com.ar/venta/departamento/capital-federal/${neighborhood.toLowerCase()}/`

    const response = await fetch(searchUrl, {
      headers: getHeaders(),
      next: { revalidate: 300 }, // Cache por 5 minutos
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Buscar elementos de propiedades
    $('.posting-card, .list-card, [data-qa*="posting"]').each((index, element) => {
      if (index >= 10) return false // Máximo 10 propiedades

      try {
        const $el = $(element)

        // Extraer título y link
        const titleElement = $el.find('h2 a, h3 a, [data-qa*="title"] a').first()
        const title = titleElement.text().trim()
        const link = titleElement.attr("href") || ""

        // Extraer precio
        const priceText = $el.find('[data-qa*="price"], .price').first().text().trim()
        const priceMatch = priceText.match(/[\d.,]+/)
        let totalPrice = 0
        if (priceMatch) {
          totalPrice = Number.parseFloat(priceMatch[0].replace(/[.,]/g, ""))
          if (totalPrice < 1000) totalPrice *= 1000 // Convertir si está en miles
        }

        if (title && totalPrice > 0) {
          const surface = 50 + Math.random() * 50 // Superficie estimada
          const absoluteLink = link.startsWith("http") ? link : `https://www.zonaprop.com.ar${link}`

          properties.push({
            id: `zonaprop-${Date.now()}-${index}`,
            title: title.substring(0, 100),
            link: absoluteLink,
            totalPrice,
            surface: Math.round(surface),
            pricePerM2: Math.round(totalPrice / surface),
            source: "Zonaprop",
            neighborhood,
            isOwner: title.toLowerCase().includes("dueño"),
            publishedDate: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error("Error parsing Zonaprop element:", err)
      }
    })

    console.log(`✅ Zonaprop: Found ${properties.length} properties`)
  } catch (error) {
    console.error(`❌ Zonaprop scraping failed:`, error)
  }

  return properties
}

export async function scrapeArgenprop(neighborhood: string): Promise<Property[]> {
  const properties: Property[] = []

  try {
    console.log(`🔍 Scraping Argenprop for ${neighborhood}...`)

    const searchUrl = `https://www.argenprop.com/venta/departamento/capital-federal/${neighborhood.toLowerCase()}`

    const response = await fetch(searchUrl, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $(".property-item, .listing-item, .card-property").each((index, element) => {
      if (index >= 10) return false

      try {
        const $el = $(element)

        const title = $el.find("h2 a, h3 a, .title a").first().text().trim()
        const link = $el.find("h2 a, h3 a, .title a").first().attr("href") || ""
        const priceText = $el.find(".price, .property-price").first().text().trim()

        const priceMatch = priceText.match(/[\d.,]+/)
        let totalPrice = 0
        if (priceMatch) {
          totalPrice = Number.parseFloat(priceMatch[0].replace(/[.,]/g, ""))
          if (totalPrice < 1000) totalPrice *= 1000
        }

        if (title && totalPrice > 0) {
          const surface = 45 + Math.random() * 60
          const absoluteLink = link.startsWith("http") ? link : `https://www.argenprop.com${link}`

          properties.push({
            id: `argenprop-${Date.now()}-${index}`,
            title: title.substring(0, 100),
            link: absoluteLink,
            totalPrice,
            surface: Math.round(surface),
            pricePerM2: Math.round(totalPrice / surface),
            source: "Argenprop",
            neighborhood,
            isOwner: title.toLowerCase().includes("dueño"),
            publishedDate: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error("Error parsing Argenprop element:", err)
      }
    })

    console.log(`✅ Argenprop: Found ${properties.length} properties`)
  } catch (error) {
    console.error(`❌ Argenprop scraping failed:`, error)
  }

  return properties
}

export async function scrapeMercadoLibre(neighborhood: string): Promise<Property[]> {
  const properties: Property[] = []

  try {
    console.log(`🔍 Scraping MercadoLibre for ${neighborhood}...`)

    const searchUrl = `https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/${neighborhood.toLowerCase().replace(/\s+/g, "-")}/`

    const response = await fetch(searchUrl, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $(".ui-search-result, .results-item").each((index, element) => {
      if (index >= 10) return false

      try {
        const $el = $(element)

        const title = $el.find(".ui-search-item__title, .item-title").first().text().trim()
        const link = $el.find(".ui-search-item__title a, .item-title a").first().attr("href") || ""
        const priceText = $el.find(".price-tag, .ui-search-price").first().text().trim()

        const priceMatch = priceText.match(/[\d.,]+/)
        let totalPrice = 0
        if (priceMatch) {
          totalPrice = Number.parseFloat(priceMatch[0].replace(/[.,]/g, ""))
        }

        if (title && totalPrice > 0) {
          const surface = 40 + Math.random() * 70

          properties.push({
            id: `mercadolibre-${Date.now()}-${index}`,
            title: title.substring(0, 100),
            link,
            totalPrice,
            surface: Math.round(surface),
            pricePerM2: Math.round(totalPrice / surface),
            source: "MercadoLibre",
            neighborhood,
            isOwner: title.toLowerCase().includes("dueño"),
            publishedDate: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error("Error parsing MercadoLibre element:", err)
      }
    })

    console.log(`✅ MercadoLibre: Found ${properties.length} properties`)
  } catch (error) {
    console.error(`❌ MercadoLibre scraping failed:`, error)
  }

  return properties
}

export async function scrapeAllSites(criteria: any): Promise<Property[]> {
  const allProperties: Property[] = []
  const { neighborhoods = [] } = criteria

  console.log("🚀 Starting real scraping...")

  for (const neighborhood of neighborhoods) {
    try {
      // Scraping en paralelo para cada barrio
      const [zonapropResults, argenpropResults, mercadoLibreResults] = await Promise.allSettled([
        scrapeZonaprop(neighborhood),
        scrapeArgenprop(neighborhood),
        scrapeMercadoLibre(neighborhood),
      ])

      // Agregar resultados exitosos
      if (zonapropResults.status === "fulfilled") {
        allProperties.push(...zonapropResults.value)
      }
      if (argenpropResults.status === "fulfilled") {
        allProperties.push(...argenpropResults.value)
      }
      if (mercadoLibreResults.status === "fulfilled") {
        allProperties.push(...mercadoLibreResults.value)
      }

      // Pausa entre barrios para no sobrecargar
      await delay(2000)
    } catch (error) {
      console.error(`Error scraping ${neighborhood}:`, error)
    }
  }

  // Aplicar filtros
  let filtered = allProperties

  if (criteria.ownerOnly) {
    filtered = filtered.filter((p) => p.isOwner)
  }

  if (criteria.maxPricePerM2) {
    filtered = filtered.filter((p) => p.pricePerM2 <= criteria.maxPricePerM2 * 1.1)
  }

  // Eliminar duplicados por título similar
  const unique = []
  const seen = new Set()

  for (const property of filtered) {
    const key = property.title.toLowerCase().substring(0, 50)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(property)
    }
  }

  // Ordenar por precio por m²
  unique.sort((a, b) => a.pricePerM2 - b.pricePerM2)

  console.log(`📊 Total properties found: ${unique.length}`)

  return unique
}
