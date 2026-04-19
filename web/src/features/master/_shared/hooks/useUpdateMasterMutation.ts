import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateMaster } from "../api/updateMaster.api"
import { showToast } from "@/core/toast/toast.hook"
import { masterKeys } from "../queryKeys"

export function useUpdateMasterMutation(endpoint: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: bigint; payload: any }) =>
      updateMaster(endpoint, id, payload),

    onSuccess: async () => {
      showToast("Data berhasil diperbarui", "success")

      await queryClient.invalidateQueries({
        queryKey: masterKeys.lists(endpoint),
      })
    },

    onError: (err: any) => {
      showToast(err.message, "error")
    },
  })
}