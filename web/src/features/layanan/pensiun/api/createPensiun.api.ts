import httpClient from "@/core/http/httpClient"

export interface CreatePensiunPayload {
  tmt_pensiun: string
  alasan_pensiun_id: number
  catatan?: string
}

export async function createPensiun(
  payload: CreatePensiunPayload
) {
  const res = await httpClient.post(
    "/layanan/pensiun",
    payload
  )

  return res.data
}