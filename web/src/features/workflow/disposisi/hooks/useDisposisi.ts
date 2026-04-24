import { useQuery } from "@tanstack/react-query"

import { getDisposisi } from "../api/getDisposisi.api"
import type { DisposisiFilters } from "../types"

export function useDisposisi(filters: DisposisiFilters) {
  return useQuery({
    queryKey: ["workflow", "disposisi", filters],
    queryFn: () => getDisposisi(filters),
    staleTime: 30_000,
  })
}
