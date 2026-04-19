import http from "@/core/http/httpClient"
import type { AsnStatistics } from "../types"

export async function getAsnStatistics(
  tahun?: number
): Promise<AsnStatistics> {

  const { data } = await http.get("/statistics/asn", {
    params: { tahun },
  })

  return data
}