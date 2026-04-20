import { postRequest } from "@/core/http"

import type {
  DmsImportResult,
  ImportDmsBatchPayload,
} from "../types"
import { mapDmsImportResult } from "../utils"

export async function importDmsBatch(
  payload: ImportDmsBatchPayload,
): Promise<DmsImportResult> {
  const formData = new FormData()

  formData.append("file", payload.file)

  if (payload.batchId) {
    formData.append("batchId", payload.batchId)
  }

  if (payload.unorId) {
    formData.append("unorId", payload.unorId)
  }

  if (payload.periodeLabel) {
    formData.append("periodeLabel", payload.periodeLabel)
  }

  if (payload.catatan) {
    formData.append("catatan", payload.catatan)
  }

  const response = await postRequest<Record<string, unknown>, FormData>(
    "/dms-monitoring/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  )

  return mapDmsImportResult(response)
}