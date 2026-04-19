// src/features/master/_shared/hooks/useToggleMaster.ts

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleMaster } from "../api/toggleMaster.api"
import { showToast } from "@/core/toast/toast.hook"
import { masterKeys } from "../queryKeys"

export function useToggleMaster(endpoint: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: bigint | number) =>
      toggleMaster(endpoint, id),

    onSuccess: async () => {
      showToast("Status berhasil diperbarui", "success")

      await queryClient.invalidateQueries({
        queryKey: masterKeys.lists(endpoint),
      })
    },

    onError: (error: any) => {
      showToast(error?.message || "Gagal mengubah status", "error")
    },
  })
}