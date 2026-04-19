import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteMaster } from "../api/deleteMaster.api"
import { showToast } from "@/core/toast/toast.hook"
import { masterKeys } from "../queryKeys"

export function useDeleteMasterMutation(endpoint: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: bigint) =>
      deleteMaster(endpoint, id),

    onSuccess: async () => {
      showToast("Data berhasil dihapus", "success")

      await queryClient.invalidateQueries({
        queryKey: masterKeys.lists(endpoint),
      })
    },

    onError: (err: any) => {
      showToast(err.message, "error")
    },
  })
}