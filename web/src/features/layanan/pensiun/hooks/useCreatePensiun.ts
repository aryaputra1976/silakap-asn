import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPensiun } from "../api/createPensiun.api"

export function useCreatePensiun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPensiun,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pensiun-list"],
      })
    },
  })
}