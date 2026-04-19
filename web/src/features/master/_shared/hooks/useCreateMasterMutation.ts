import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createMaster } from "../api/createMaster.api"
import { showToast } from "@/core/toast/toast.hook"
import { masterKeys } from "../queryKeys"

export function useCreateMasterMutation(endpoint: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { kode: string; nama: string }) =>
      createMaster(endpoint, payload),

    onSuccess: async () => {
      showToast("Data berhasil ditambahkan", "success")

      await queryClient.invalidateQueries({
        queryKey: masterKeys.lists(endpoint),
      })
    },

    onError: (err: any) => {
      showToast(err.message, "error")
    },
  })
}