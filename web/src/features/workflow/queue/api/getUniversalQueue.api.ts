import httpClient from "@/core/http/httpClient"
import type {
  UniversalQueueResponse,
  UniversalQueueFilters,
} from "../types"

export async function getUniversalQueue(
  params: UniversalQueueFilters
): Promise<UniversalQueueResponse> {

  const res = await httpClient.get<UniversalQueueResponse>(
    "/workflow/queue",
    {
      params,
    }
  )

  return res.data

}