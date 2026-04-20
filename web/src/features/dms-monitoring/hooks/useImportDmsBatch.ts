import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

import { importDmsBatch } from "../api"
import type { ImportDmsBatchPayload } from "../types"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useImportDmsBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ImportDmsBatchPayload) =>
      importDmsBatch(payload),
    onSuccess: async (result) => {
      if (result.imported.status === "IMPORTED") {
        toast.success("Import DMS berhasil selesai")
      } else if (result.imported.status === "PARTIAL") {
        toast.success("Import DMS selesai dengan sebagian error")
      } else {
        toast.error("Import DMS gagal")
      }

      await queryClient.invalidateQueries({
        queryKey: DMS_MONITORING_QUERY_KEYS.root,
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Gagal import DMS"
      toast.error(message)
    },
  })
}