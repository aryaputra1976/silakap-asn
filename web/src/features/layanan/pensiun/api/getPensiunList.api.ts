import httpClient from "@/core/http/httpClient"
import { PensiunListResponse } from "../types"

export async function getPensiunList(
  page: number,
  limit: number,
  status?: string
): Promise<PensiunListResponse> {
  const res = await httpClient.get("/layanan/self", {
    params: {
      page,
      limit,
      jenis: "PENSIUN",
      ...(status ? { status } : {}),
    },
  })

  return res.data
}