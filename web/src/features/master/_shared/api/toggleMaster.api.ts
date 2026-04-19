// src/features/master/_shared/api/toggleMaster.api.ts

import http from "@/core/http/httpClient"

export async function toggleMaster(
  endpoint: string,
  id: bigint | number
): Promise<void> {
  await http.patch(`${endpoint}/${id}/toggle-active`)
}