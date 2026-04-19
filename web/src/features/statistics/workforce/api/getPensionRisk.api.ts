import http from "@/core/http/httpClient"
import type { PensionRiskData } from "../types"

export async function getPensionRisk(tahun: number): Promise<PensionRiskData> {
  const { data } = await http.get(`/statistics/workforce/pension-risk/${tahun}`)
  return data
}
