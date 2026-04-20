import { getRequest } from "@/core/http"

import type { DmsBatchItem } from "../types"
import { mapDmsBatchDetailResponse } from "../utils"

export async function getDmsBatchDetail(
  id: string,
): Promise<DmsBatchItem> {
  const response = await getRequest<Record<string, unknown>>(
    `/dms-monitoring/batches/${id}`,
  )

  return mapDmsBatchDetailResponse(response)
}