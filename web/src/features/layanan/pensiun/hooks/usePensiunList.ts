import { useQuery } from "@tanstack/react-query"
import { getPensiunList } from "../api/getPensiunList.api"

export function usePensiunList(
  page: number,
  status?: string
) {
  return useQuery({
    queryKey: ["pensiun-list", page, status ?? null],
    queryFn: () => getPensiunList(page, 10, status),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}