import http from "@/core/http/httpClient"
import type { WorkforceDetail } from "../types"

export async function getWorkforceDetail(
  tahun: number,
  unorId: number
): Promise<WorkforceDetail> {
  const { data } = await http.get(
    `/statistics/workforce/${tahun}/${unorId}`
  )
  return data
}