import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export const useUnorStats = (unitId?: number) => {

  const [stats, setStats] = useState<any>(null)

  useEffect(() => {

    if (!unitId) return

    http
      .get(`/ref/unor/${unitId}/stats`)
      .then(res => setStats(res.data))

  }, [unitId])

  return stats

}