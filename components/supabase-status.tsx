"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Activity, Clock, CheckCircle, XCircle } from "lucide-react"

interface SupabaseTest {
  connection: string
  read: string
  insert: string
  jobs: string
}

interface SupabaseData {
  totalProperties: number
  sampleProperties: any[]
  testProperty?: any
  testJob?: any
}

export function SupabaseStatus() {
  const [tests, setTests] = useState<SupabaseTest | null>(null)
  const [data, setData] = useState<SupabaseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testSupabase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-supabase")
      const result = await response.json()

      if (response.ok && result.success) {
        setTests(result.tests)
        setData(result.data)
      } else {
        setError(result.error || "Test failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testSupabase()
  }, [])

  const getTestIcon = (status: string) => {
    if (status.includes("✅")) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status.includes("⚠️")) return <Clock className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = () => {
    if (!tests) return "bg-gray-500"
    const allGood = Object.values(tests).every((status) => status.includes("✅"))
    const someWarnings = Object.values(tests).some((status) => status.includes("⚠️"))

    if (allGood) return "bg-green-500"
    if (someWarnings) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Supabase
          {tests && (
            <Badge variant={Object.values(tests).every((s) => s.includes("✅")) ? "default" : "secondary"}>
              {Object.values(tests).every((s) => s.includes("✅")) ? "Conectado" : "Parcial"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {tests && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Pruebas de Conexión:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tests).map(([key, status]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {getTestIcon(status)}
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Datos:</h4>
              <div className="text-sm text-muted-foreground">
                <div>📊 Total propiedades: {data.totalProperties || 0}</div>
                <div>📝 Propiedades de ejemplo: {data.sampleProperties?.length || 0}</div>
                {data.testProperty && <div>✅ Propiedad de prueba creada</div>}
                {data.testJob && <div>✅ Trabajo de scraping creado</div>}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm">
              {tests
                ? Object.values(tests).every((s) => s.includes("✅"))
                  ? "Supabase funcionando correctamente"
                  : "Supabase conectado con limitaciones"
                : "Verificando conexión..."}
            </span>
          </div>

          <Button onClick={testSupabase} variant="outline" size="sm" disabled={loading} className="w-full">
            <Activity className="h-4 w-4 mr-2" />
            {loading ? "Probando..." : "Probar Conexión"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
