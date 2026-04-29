import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnPangkat {
  id: number
  tmt: string
  nomorSk?: string | null
  tanggalSk?: string | null
  golongan?: string | null
}

export function useAsnPangkat(asnId?: string) {
  const [data, setData] = useState<AsnPangkat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asnId) return

    let isActive = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get<AsnPangkat[]>(`/asn/${asnId}/pangkat`)

        if (isActive) {
          setData(res.data)
        }
      } catch (err) {
        if (isActive) {
          console.error("PANGKAT ERROR", err)
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
