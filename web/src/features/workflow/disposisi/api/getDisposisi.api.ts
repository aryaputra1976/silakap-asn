import httpClient from "@/core/http/httpClient"

import type { DisposisiFilters, DisposisiResponse } from "../types"

export async function getDisposisi(
  params: DisposisiFilters
): Promise<DisposisiResponse> {
  const response = await httpClient.get<DisposisiResponse>("/workflow/disposisi", {
    params,
  })

  return response.data
}
