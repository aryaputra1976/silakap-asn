import { useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyLayanan } from "../api/verifyLayanan.api"
import { workflowQueueKeys } from "../queryKeys"

interface VerifyPayload {
  layanan: string
  id: string
  action: "approve" | "reject"
  payload?: any
}

export function useVerifyLayanan() {

  const queryClient = useQueryClient()

  return useMutation({

    mutationFn: ({
      layanan,
      id,
      action,
      payload,
    }: VerifyPayload) =>
      verifyLayanan(layanan, id, action, payload),

    onMutate: async ({ id }) => {

      await queryClient.cancelQueries({
        queryKey: workflowQueueKeys.all,
      })

      const prev = queryClient.getQueriesData({
        queryKey: workflowQueueKeys.all,
      })

      queryClient.setQueriesData(
        { queryKey: workflowQueueKeys.all },
        (old: any) => {

          if (!old?.data) return old

          return {
            ...old,
            data: old.data.filter(
              (item: any) => item.id !== Number(id)
            ),
          }

        }
      )

      return { prev }

    },

    onError: (_err, _vars, ctx) => {

      ctx?.prev?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data)
      })

    },

    onSettled: () => {

      queryClient.invalidateQueries({
        queryKey: workflowQueueKeys.all,
      })

    },

  })

}