import { postRequest } from "@/core/http"

import type {
  CreateDmsBatchPayload,
  DmsBatchItem,
} from "../types"
import { mapDmsBatchDetailResponse } from "../utils"

export async function createDmsBatch(
  payload: CreateDmsBatchPayload,
): Promise<DmsBatchItem> {
  const response = await postRequest<
    Record<string, unknown>,
    CreateDmsBatchPayload
  >("/dms-monitoring/batches", payload)

  return mapDmsBatchDetailResponse(response)
}