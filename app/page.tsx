"use client"

import { useState } from "react"
import { PropertyForm } from "@/components/property-form"
import { PropertyResults } from "@/components/property-results"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Property } from "@/lib/types"

export default function Home() {
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (criteria: any) => {
    setLoading(true)
    setError(null)
    setSearchCriteria(criteria)

    try {
      const response = await fetch("/api/search-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResults(data.properties || [])

      if (!data.properties || data.properties.length === 0) {
        setError("No se encontraron propiedades con los criterios seleccionados.")
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error)
      setError("Error al buscar propiedades: " + (error.message || "Error desconocido"))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleEmail = async (email: string) => {
    try {
      const response = await fetch("/api/schedule-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          scheduleTime: "09:00",
          neighborhoods: searchCriteria?.neighborhoods || ["Palermo"],
          ownerOnly: searchCriteria?.ownerOnly || false,
          timeRange: "7d",
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Email programado exitosamente para las " + (data.scheduleTime || "09:00"))
      } else {
        throw new Error(data.error || "Error al programar email")
      }
    } catch (error) {
      console.error("Error al programar email:", error)
      alert("Error al programar email: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Property Finder Argentina</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PropertyForm onSearch={handleSearch} loading={loading} onScheduleEmail={handleScheduleEmail} />
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <PropertyResults properties={results} loading={loading} searchCriteria={searchCriteria} />
          </div>
        </div>
      </main>
    </div>
  )
}
