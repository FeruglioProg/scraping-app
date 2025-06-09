"use client"

import { useState } from "react"
import { PropertyForm } from "@/components/property-form"
import { PropertyResults } from "@/components/property-results"
import { ThemeToggle } from "@/components/theme-toggle"
import { SupabaseStatus } from "@/components/supabase-status"
import type { Property } from "@/lib/types"
import { supabase } from "@/lib/supabase"

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
      // Construir la consulta a Supabase
      let query = supabase.from("properties").select("*")

      // Aplicar filtros
      if (criteria.neighborhoods && criteria.neighborhoods.length > 0) {
        query = query.in("neighborhood", criteria.neighborhoods)
      }

      if (criteria.ownerOnly) {
        query = query.eq("is_owner", true)
      }

      if (criteria.maxPricePerM2) {
        query = query.lte("price_per_m2", criteria.maxPricePerM2)
      }

      // Ejecutar la consulta
      const { data, error: supabaseError } = await query.order("price_per_m2").limit(50)

      if (supabaseError) throw supabaseError

      setResults(data || [])

      if (data?.length === 0) {
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
    // Implementación pendiente
    alert("Función de programación de emails pendiente de implementar")
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
            <div className="mt-4">
              <SupabaseStatus />
            </div>
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
