"use client"

import { useState } from "react"
import { RealSearchForm } from "@/components/real-search-form"
import { PropertyResults } from "@/components/property-results"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Property } from "@/lib/types"

export default function Home() {
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchInfo, setSearchInfo] = useState<string | null>(null)

  const handleRealSearch = async (criteria: any) => {
    setLoading(true)
    setError(null)
    setSearchInfo(null)
    setSearchCriteria(criteria)

    try {
      console.log("🚀 Starting real search...")

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Property Finder Argentina</h1>
            <p className="text-sm text-muted-foreground">Scraping real de Zonaprop, Argenprop y MercadoLibre</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <RealSearchForm onSearch={handleRealSearch} loading={loading} />
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {searchInfo && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200">{searchInfo}</p>
              </div>
            )}

            <PropertyResults properties={results} loading={loading} searchCriteria={searchCriteria} />
          </div>
        </div>
      </main>
    </div>
  )
}
