import { useQuery } from "@tanstack/react-query"
import { getUniversalQueue } from "../api/getUniversalQueue.api"
import { workflowQueueKeys } from "../queryKeys"
import type {
  UniversalQueueFilters,
  UniversalQueueResponse,
} from "../types"

export function useUniversalQueue(
  filters: UniversalQueueFilters
) {

  const cleanedFilters = {

    page: filters.page ?? 1,

    limit: filters.limit ?? 10,

    ...(filters.search ? { search: filters.search } : {}),

    ...(filters.status ? { status: filters.status } : {}),

    ...(filters.jenis ? { jenis: filters.jenis } : {}),

  }

  return useQuery<UniversalQueueResponse>({

    queryKey: workflowQueueKeys.list(cleanedFilters),

    queryFn: () => getUniversalQueue(cleanedFilters),

    placeholderData: (prev) => prev,

    staleTime: 30_000,

    gcTime: 5 * 60 * 1000,

    refetchOnWindowFocus: true,

    refetchOnReconnect: true,

    retry: 1,

  })

}