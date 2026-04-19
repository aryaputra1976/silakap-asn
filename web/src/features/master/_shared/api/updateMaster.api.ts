import http from "@/core/http/httpClient"

export async function updateMaster(
  endpoint: string,
  id: bigint,
  payload: { kode?: string; nama?: string }
) {
  const { data } = await http.patch(`${endpoint}/${id}`, payload)
  return data
}