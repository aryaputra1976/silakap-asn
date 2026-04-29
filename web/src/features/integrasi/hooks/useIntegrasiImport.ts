import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  commitImportBatch,
  createMissingPendidikanReferences,
  getImportBatchDetail,
  getImportBatchErrors,
  getImportBatches,
  getMissingReferences,
  validateImportBatch,
} from "../api/integrasi.api"
import type { ImportBatchQuery } from "../types"

export function useIntegrasiImportBatchDetail(batchId: string | null) {
  return useQuery({
    queryKey: ["integrasi", "import-batch-detail", batchId],
    queryFn: ({ signal }) => getImportBatchDetail(batchId ?? "", { signal }),
    enabled: Boolean(batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.status?.toUpperCase()
      return status === "VALIDATING" || status === "COMMITTING" ? 3000 : false
    },
  })
}

export function useIntegrasiImportBatches(query: ImportBatchQuery) {
  return useQuery({
    queryKey: ["integrasi", "import-batches", query],
    queryFn: ({ signal }) => getImportBatches(query, { signal }),
  })
}

export function useIntegrasiImportErrors(
  batchId: string | null,
  query: ImportBatchQuery,
) {
  return useQuery({
    queryKey: ["integrasi", "import-errors", batchId, query],
    queryFn: ({ signal }) =>
      getImportBatchErrors(batchId ?? "", query, { signal }),
    enabled: Boolean(batchId),
  })
}

export function useIntegrasiMissingReferences(batchId: string | null) {
  return useQuery({
    queryKey: ["integrasi", "missing-references", batchId],
    queryFn: ({ signal }) => getMissingReferences(batchId ?? "", { signal }),
    enabled: Boolean(batchId),
  })
}

export function useValidateIntegrasiBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: validateImportBatch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrasi"] })
    },
  })
}

export function useCommitIntegrasiBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: commitImportBatch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrasi"] })
    },
  })
}

export function useCreatePendidikanReferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMissingPendidikanReferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrasi"] })
    },
  })
}
