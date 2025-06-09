import type { Property } from "./types"

export const mockProperties: Property[] = [
  {
    id: "mock-1",
    title: "Departamento 2 ambientes en Palermo Hollywood",
    link: "https://www.zonaprop.com.ar/ejemplo-1",
    totalPrice: 180000,
    surface: 65,
    pricePerM2: 2769,
    source: "Zonaprop",
    neighborhood: "Palermo",
    isOwner: true,
    publishedDate: new Date(),
  },
  {
    id: "mock-2",
    title: "Monoambiente luminoso en Belgrano",
    link: "https://www.argenprop.com/ejemplo-2",
    totalPrice: 120000,
    surface: 45,
    pricePerM2: 2667,
    source: "Argenprop",
    neighborhood: "Belgrano",
    isOwner: false,
    publishedDate: new Date(),
  },
  {
    id: "mock-3",
    title: "Departamento de categoría en Recoleta",
    link: "https://inmuebles.mercadolibre.com.ar/ejemplo-3",
    totalPrice: 250000,
    surface: 85,
    pricePerM2: 2941,
    source: "MercadoLibre",
    neighborhood: "Recoleta",
    isOwner: true,
    publishedDate: new Date(),
  },
  {
    id: "mock-4",
    title: "Loft en San Telmo histórico",
    link: "https://www.zonaprop.com.ar/ejemplo-4",
    totalPrice: 140000,
    surface: 55,
    pricePerM2: 2545,
    source: "Zonaprop",
    neighborhood: "San Telmo",
    isOwner: true,
    publishedDate: new Date(),
  },
  {
    id: "mock-5",
    title: "Departamento en Villa Crespo con terraza",
    link: "https://www.argenprop.com/ejemplo-5",
    totalPrice: 155000,
    surface: 60,
    pricePerM2: 2583,
    source: "Argenprop",
    neighborhood: "Villa Crespo",
    isOwner: false,
    publishedDate: new Date(),
  },
  {
    id: "mock-6",
    title: "2 ambientes en Caballito cerca del parque",
    link: "https://www.zonaprop.com.ar/ejemplo-6",
    totalPrice: 135000,
    surface: 55,
    pricePerM2: 2455,
    source: "Zonaprop",
    neighborhood: "Caballito",
    isOwner: false,
    publishedDate: new Date(),
  },
  {
    id: "mock-7",
    title: "Departamento en Flores cerca del subte",
    link: "https://www.argenprop.com/ejemplo-7",
    totalPrice: 110000,
    surface: 50,
    pricePerM2: 2200,
    source: "Argenprop",
    neighborhood: "Flores",
    isOwner: true,
    publishedDate: new Date(),
  },
  {
    id: "mock-8",
    title: "PH reciclado en Barracas",
    link: "https://inmuebles.mercadolibre.com.ar/ejemplo-8",
    totalPrice: 140000,
    surface: 70,
    pricePerM2: 2000,
    source: "MercadoLibre",
    neighborhood: "Barracas",
    isOwner: true,
    publishedDate: new Date(),
  },
]

export function searchProperties(criteria: any): Property[] {
  let filtered = [...mockProperties]

  // Filter by neighborhoods
  if (criteria.neighborhoods && criteria.neighborhoods.length > 0) {
    filtered = filtered.filter((property) =>
      criteria.neighborhoods.some((n: string) => property.neighborhood.toLowerCase() === n.toLowerCase()),
    )
  }

  // Filter by owner
  if (criteria.ownerOnly) {
    filtered = filtered.filter((property) => property.isOwner)
  }

  // Filter by price per m²
  if (criteria.maxPricePerM2 && criteria.maxPricePerM2 > 0) {
    filtered = filtered.filter((property) => property.pricePerM2 <= criteria.maxPricePerM2 * 1.1)
  }

  // Sort by price per m²
  filtered.sort((a, b) => a.pricePerM2 - b.pricePerM2)

  return filtered
}
