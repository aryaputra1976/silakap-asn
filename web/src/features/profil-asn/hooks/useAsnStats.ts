import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnStats {
  total: number
  pns: number
  pppk: number
  pppkParuhWaktu: number
}

export function useAsnStats(unorId?: number) {

  const [stats, setStats] = useState<AsnStats>({
    total: 0,
    pns: 0,
    pppk: 0,
    pppkParuhWaktu: 0
  })

  useEffect(() => {

    const fetchStats = async () => {

      try {

        const params: any = {}

        if (unorId) {
          params.unorId = unorId
        }

        const res = await http.get("/asn/stats", {
          params
        })

        setStats({
          total: res.data.total ?? 0,
          pns: res.data.pns ?? 0,
          pppk: res.data.pppk ?? 0,
          pppkParuhWaktu: res.data.pppkParuhWaktu ?? 0
        })

      } catch (err) {

        console.error("ASN STATS ERROR", err)

      }

    }

    fetchStats()

  }, [unorId])

  return { stats }

}