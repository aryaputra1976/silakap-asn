import http from "@/core/http/httpClient"

export async function createMaster(
  endpoint: string,
  payload: { kode: string; nama: string }
) {
  const { data } = await http.post(endpoint, payload)
  return data
}