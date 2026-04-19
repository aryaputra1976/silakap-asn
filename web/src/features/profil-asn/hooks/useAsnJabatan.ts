import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnJabatan {
  id: number
  jabatan: string
  unitKerja: string
  tmt: string
  nomorSk?: string
}

export function useAsnJabatan(asnId?: string) {
  const [data, setData] = useState<AsnJabatan[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asnId) return

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get(`/asn/${asnId}/jabatan`)
        setData(res.data)
      } catch (err) {
        console.error("JABATAN ERROR", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [asnId])

  return { data, loading }
}