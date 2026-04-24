import { useEffect, useState } from "react"
import {
  getServiceDashboard,
  ServiceDashboardResponse
} from "../api/dashboard.api"

export function useServiceDashboard(
  service: string,
  enabled = true,
) {

  const [data, setData] = useState<ServiceDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {

    let active = true

    async function load() {
      try {
        setLoading(true)
        const result = await getServiceDashboard(service)

        if (active) {
          setData(result)
          setError(null)
        }

      } catch (err) {

        if (active) {
          setError(err as Error)
        }

      } finally {

        if (active) {
          setLoading(false)
        }

      }
    }

    if (enabled && service) {
      load()
    } else {
      setLoading(false)
    }

    return () => {
      active = false
    }

  }, [enabled, service])

  return { data, loading, error }
}
