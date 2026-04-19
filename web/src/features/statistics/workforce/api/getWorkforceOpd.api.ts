import http from "@/core/http/httpClient"
import type { WorkforceOpd } from "../types"

export async function getWorkforceOpd(
  tahun: number
): Promise<WorkforceOpd[]> {

  const { data } = await http.get<WorkforceOpd[]>(
    "/statistics/workforce/all-opd",
    { params: { tahun } }
  )

  return data

}