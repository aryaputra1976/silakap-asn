import http from "@/core/http/httpClient"
import type { MasterListResponse, MasterQueryParams } from "../types"

export async function getMasterList<T>(
  endpoint: string,
  params: MasterQueryParams
): Promise<MasterListResponse<T>> {
  const { data } = await http.get(endpoint, { params })
  return data
}