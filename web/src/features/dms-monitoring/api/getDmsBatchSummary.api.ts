import { getRequest } from "@/core/http"

import type { DmsBatchSummaryResponse } from "../types"
import { mapDmsBatchSummaryResponse } from "../utils"

export async function getDmsBatchSummary(
  id: string,
): Promise<DmsBatchSummaryResponse> {
  const response = await getRequest<Record<string, unknown>>(
    `/dms-monitoring/batches/${id}/summary`,
  )

  return mapDmsBatchSummaryResponse(response)
}