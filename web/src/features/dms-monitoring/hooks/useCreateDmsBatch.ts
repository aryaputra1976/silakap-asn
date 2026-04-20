import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

import { createDmsBatch } from "../api"
import type { CreateDmsBatchPayload } from "../types"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useCreateDmsBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDmsBatchPayload) =>
      createDmsBatch(payload),
    onSuccess: async () => {
      toast.success("Batch DMS berhasil dibuat")
      await queryClient.invalidateQueries({
        queryKey: DMS_MONITORING_QUERY_KEYS.root,
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal membuat batch DMS"
      toast.error(message)
    },
  })
}