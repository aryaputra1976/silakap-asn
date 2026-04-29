import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnDiklat {
  id: number
  nama?: string | null
  tahun?: number | null
}

export function useAsnDiklat(asnId?: string) {
  const [data, setData] = useState<AsnDiklat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asnId) return

    let isActive = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get<AsnDiklat[]>(`/asn/${asnId}/diklat`)

        if (isActive) {
          setData(res.data)
        }
      } catch (err) {
        if (isActive) {
          console.error("DIKLAT ERROR", err)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [asnId])

  return { data, loading }
}
