import { useQuery } from "@tanstack/react-query"
import { getUniversalQueue } from "../api/getUniversalQueue.api"
import { workflowQueueKeys } from "../queryKeys"

export function useQueueCount() {

  return useQuery({

    queryKey: workflowQueueKeys.count,

    queryFn: async () => {

      const res = await getUniversalQueue({
        page: 1,
        limit: 1,
      })

      return res.meta.total

    },

    staleTime: 60_000,
    refetchOnWindowFocus: true,

  })

}