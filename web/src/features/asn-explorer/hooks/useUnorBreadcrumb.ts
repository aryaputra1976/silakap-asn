import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export const useUnorBreadcrumb = (unitId?: number) => {

  const [path, setPath] = useState<any[]>([])

  useEffect(() => {

    if (!unitId) return

    http
      .get(`/ref/unor/${unitId}/breadcrumb`)
      .then(res => setPath(res.data))

  }, [unitId])

  return path

}