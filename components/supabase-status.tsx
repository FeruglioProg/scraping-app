"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabase-safe"

export function SupabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle" | "not-configured">("idle")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setStatus("loading")
    setError(null)

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setStatus("not-configured")
      setError("Supabase credentials not configured")
      return
    }

    try {
      const result = await testSupabaseConnection()

      if (result.success) {
        setStatus("success")
        setData({ message: result.message })
      } else {
        setStatus("error")
        setError(result.message)
      }
    } catch (err) {
      console.error("Error al probar Supabase:", err)
      setError(err.message || "Error desconocido")
      setStatus("error")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusBadge = () => {
    switch (status) {
      case "loading":
        return <Badge className="bg-yellow-500">Verificando...</Badge>
      case "success":
        return <Badge className="bg-green-500">Conectado</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "not-configured":
        return <Badge className="bg-orange-500">No Configurado</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "not-configured":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Supabase
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === "not-configured" && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-800 dark:text-orange-200">Configuración Pendiente</span>
              </div>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Para usar Supabase, configura las variables de entorno:
              </p>
              <ul className="text-xs text-orange-600 dark:text-orange-400 mt-2 space-y-1">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• SUPABASE_SERVICE_ROLE_KEY</li>
              </ul>
            </div>
          )}

          {error && status !== "not-configured" && (
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
                <p>{data.message}</p>
              </div>
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
