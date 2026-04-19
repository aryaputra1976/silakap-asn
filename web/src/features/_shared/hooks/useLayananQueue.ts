import { useQuery, keepPreviousData } from "@tanstack/react-query"
import httpClient from "@/core/http/httpClient"

interface QueueParams {
  jenis?: string
  status?: string
  search?: string
  page?: number
}

export function useLayananQueue(params: QueueParams) {
  const query = useQuery({
    queryKey: ["layananQueue", params],
    queryFn: async ({ signal }) => {
      const res = await httpClient.get("/layanan/queue", {
        signal,
        params: {
          page: params.page ?? 1,
          limit: 10,
          jenis: params.jenis,
          status: params.status,
          search: params.search,
        },
      })
      return res.data
    },

    // 🔥 v5 replacement
    placeholderData: keepPreviousData,
  })

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    refetch: query.refetch,
  }
}