import { useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"

import { getMasterList } from "../api/getMasterList.api"
import type {
  MasterQueryParams,
  MasterListResponse,
} from "../types"
import { masterKeys } from "../queryKeys"

/**
 * Remove:
 * - undefined
 * - empty string
 * - null
 */
function cleanParams(params: MasterQueryParams): MasterQueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== "" &&
        value !== null
    )
  ) as MasterQueryParams
}

export function useMasterQuery<T>(
  endpoint: string,
  params: MasterQueryParams
) {
  /**
   * Memoize cleaned params
   * Prevent new object reference every render
   */
  const cleanedParams = useMemo(
    () => cleanParams(params),
    [params]
  )

  return useQuery<MasterListResponse<T>, Error>({
    queryKey: masterKeys.list(endpoint, cleanedParams),

    queryFn: () =>
      getMasterList<T>(endpoint, cleanedParams),

    /**
     * Keep previous page data while loading new page
     * Prevent flicker
     */
    placeholderData: keepPreviousData,

    /**
     * Data considered fresh for 30 seconds
     * Avoid unnecessary refetch
     */
    staleTime: 30_000,

    /**
     * Optional tuning (recommended for master data)
     */
    refetchOnWindowFocus: false,
    retry: 1,
  })
}