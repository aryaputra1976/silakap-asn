import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnPendidikan {
  id: number
  jenjang?: string | null
  bidangStudi?: string | null
  namaSekolah?: string | null
  tahunLulus?: number | null
}

export function useAsnPendidikan(asnId?: string) {
  const [data, setData] = useState<AsnPendidikan[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asnId) return

    let isActive = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get<AsnPendidikan[]>(`/asn/${asnId}/pendidikan`)

        if (isActive) {
          setData(res.data)
        }
      } catch (err) {
        if (isActive) {
          console.error("PENDIDIKAN ERROR", err)
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
