import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnStats {
  total: number
  pns: number
  pppk: number
  pppkParuhWaktu: number
}

interface FetchStatsParams {
  unorId?: number
}

export function useAsnStats(unorId?: number) {
  const [stats, setStats] = useState<AsnStats>({
    total: 0,
    pns: 0,
    pppk: 0,
    pppkParuhWaktu: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    const fetchStats = async () => {
      setLoading(true)

      try {
        const params: FetchStatsParams = {}

        if (unorId) {
          params.unorId = unorId
        }

        const res = await http.get<AsnStats>("/asn/stats", {
          params,
        })

        if (isActive) {
          setStats({
            total: res.data.total ?? 0,
            pns: res.data.pns ?? 0,
            pppk: res.data.pppk ?? 0,
            pppkParuhWaktu: res.data.pppkParuhWaktu ?? 0,
          })
        }
      } catch (err) {
        if (isActive) {
          console.error("ASN STATS ERROR", err)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isActive = false
    }
  }, [unorId])

  return { stats, loading }
}