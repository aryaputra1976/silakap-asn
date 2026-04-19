import http from "@/core/http/httpClient"
import type { AsnEntity } from "../types"

export type AsnQueryParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export type AsnListResponse = {
  data: AsnEntity[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export async function getAsnList(
  params: AsnQueryParams
): Promise<AsnListResponse> {

  const response = await http.get("/asn", {
    params,
  })

  return response.data
}