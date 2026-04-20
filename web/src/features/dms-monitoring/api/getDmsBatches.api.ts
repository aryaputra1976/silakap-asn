import { getRequest } from "@/core/http"

import type { DmsBatchFilters, DmsBatchListResponse } from "../types"
import {
  buildDmsBatchQueryParams,
  mapDmsBatchListResponse,
} from "../utils"

export async function getDmsBatches(
  filters: DmsBatchFilters,
): Promise<DmsBatchListResponse> {
  const response = await getRequest<Record<string, unknown>>(
    "/dms-monitoring/batches",
    {
      params: buildDmsBatchQueryParams(filters),
    },
  )

  return mapDmsBatchListResponse(response)
}