"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Activity, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SupabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setStatus("loading")
    setError(null)

    try {
      // Verificar conexión básica
      const { data: countData, error: countError } = await supabase
        .from("properties")
        .select("count", { count: "exact", head: true })

      if (countError) throw countError

      // Obtener algunas propiedades
      const { data: properties, error: propertiesError } = await supabase.from("properties").select("*").limit(3)

      if (propertiesError) throw propertiesError

      setData({
        count: countData,
        properties,
      })
      setStatus("success")
    } catch (err) {
      console.error("Error al probar Supabase:", err)
      setError(err.message || "Error desconocido")
      setStatus("error")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Supabase
          {status === "loading" && <Badge className="bg-yellow-500">Verificando...</Badge>}
          {status === "success" && <Badge className="bg-green-500">Conectado</Badge>}
          {status === "error" && <Badge variant="destructive">Error</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {status === "success" && data && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Conexión establecida</span>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Total de propiedades: {data.count}</p>
                <p>Propiedades cargadas: {data.properties?.length || 0}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Error de conexión</span>
            </div>
          )}

          <Button
            onClick={testConnection}
            variant="outline"
            size="sm"
            disabled={status === "loading"}
            className="w-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            {status === "loading" ? "Probando..." : "Probar Conexión"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
