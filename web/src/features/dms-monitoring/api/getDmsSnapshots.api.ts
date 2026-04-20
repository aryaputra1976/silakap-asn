import { getRequest } from "@/core/http"

import type {
  DmsSnapshotFilters,
  DmsSnapshotListResponse,
} from "../types"
import {
  buildDmsSnapshotQueryParams,
  mapDmsSnapshotListResponse,
} from "../utils"

export async function getDmsSnapshots(
  filters: DmsSnapshotFilters,
): Promise<DmsSnapshotListResponse> {
  const response = await getRequest<Record<string, unknown>>(
    "/dms-monitoring/snapshots",
    {
      params: buildDmsSnapshotQueryParams(filters),
    },
  )

  return mapDmsSnapshotListResponse(response)
}