"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, AlertCircle } from "lucide-react"

const neighborhoods = [
  "Palermo",
  "Belgrano",
  "Recoleta",
  "Puerto Madero",
  "San Telmo",
  "Villa Crespo",
  "Caballito",
  "Flores",
  "Almagro",
  "Barracas",
]

export default function Home() {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([])
  const [ownerOnly, setOwnerOnly] = useState(false)
  const [maxPricePerM2, setMaxPricePerM2] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [searchInfo, setSearchInfo] = useState(null)

  const handleNeighborhoodChange = (neighborhood, checked) => {
    if (checked) {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood])
    } else {
      setSelectedNeighborhoods(selectedNeighborhoods.filter((n) => n !== neighborhood))
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (selectedNeighborhoods.length === 0) {
      alert("Selecciona al menos un barrio")
      return
    }

    setLoading(true)
    setError(null)
    setSearchInfo(null)

    try {
      const criteria = {
        neighborhoods: selectedNeighborhoods,
        ownerOnly,
        maxPricePerM2: maxPricePerM2 ? Number.parseFloat(maxPricePerM2) : null,
        email: email || null,
      }

      const response = await fetch("/api/search-real", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success) {
        setResults(data.properties || [])
        setSearchInfo(data.message || `Se encontraron ${data.count} propiedades`)

        if (criteria.email && data.count > 0) {
          setSearchInfo((prev) => prev + ` (enviado por email a ${criteria.email})`)
        }
      } else {
        throw new Error(data.error || "Error en la búsqueda")
      }
    } catch (error) {
      console.error("❌ Search error:", error)
      setError("Error en la búsqueda: " + error.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const fillTestData = () => {
    setSelectedNeighborhoods(["Palermo", "Belgrano"])
    setOwnerOnly(false)
    setMaxPricePerM2("3000")
    setEmail("test@gmail.com")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Property Finder Argentina</h1>
          <p className="text-gray-600">Scraping real de Zonaprop, Argenprop y MercadoLibre</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Búsqueda Real de Propiedades
                  <Badge className="bg-green-500">SCRAPING REAL</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-800">Scraping Real Activado</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Esta búsqueda obtendrá datos reales de Zonaprop, Argenprop y MercadoLibre. Puede tomar 1-2 minutos.
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Barrios */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Barrios a buscar</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {neighborhoods.map((neighborhood) => (
                        <div key={neighborhood} className="flex items-center space-x-2">
                          <Checkbox
                            id={neighborhood}
                            checked={selectedNeighborhoods.includes(neighborhood)}
                            onCheckedChange={(checked) => handleNeighborhoodChange(neighborhood, checked)}
                          />
                          <Label htmlFor={neighborhood} className="text-sm cursor-pointer">
                            {neighborhood}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedNeighborhoods.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedNeighborhoods.map((n) => (
                          <Badge key={n} variant="secondary" className="text-xs">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Solo propietarios */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ownerOnly" checked={ownerOnly} onCheckedChange={(checked) => setOwnerOnly(checked)} />
                    <Label htmlFor="ownerOnly" className="text-sm cursor-pointer">
                      Solo propiedades de propietarios (sin inmobiliarias)
                    </Label>
                  </div>

                  {/* Precio máximo por m² */}
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Precio máximo por m² (USD)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="ej: 3000"
                      value={maxPricePerM2}
                      onChange={(e) => setMaxPricePerM2(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email (opcional - para recibir resultados)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu-email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Botones */}
                  <div className="space-y-3">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? "Buscando en sitios reales..." : "🔍 Buscar Propiedades Reales"}
                    </Button>

                    <Button type="button" variant="outline" className="w-full" onClick={fillTestData}>
                      📝 Llenar con datos de prueba
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {searchInfo && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{searchInfo}</p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Resultados ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {error ? "Error en la búsqueda" : "Usa el formulario para buscar propiedades"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {results.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{property.title}</h3>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <div className="font-medium">${property.totalPrice.toLocaleString()}</div>

                              <div>{property.surface}m²</div>

                              <div className="font-medium">${property.pricePerM2}/m²</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {property.source}
                              </Badge>
                              {property.isOwner && (
                                <Badge variant="secondary" className="text-xs">
                                  Propietario
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            type="button"
                            onClick={() => window.open(property.link, "_blank", "noopener,noreferrer")}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
