import http from "@/core/http/httpClient"

export async function deleteMaster(
  endpoint: string,
  id: bigint
) {
  const { data } = await http.delete(`${endpoint}/${id}`)
  return data
}