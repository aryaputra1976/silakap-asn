import { PropsWithChildren, useState } from "react"
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query"
import { showToast } from "@/core/toast/toast.hook"
import type { HttpError } from "@/core/http/httpError"

/**
 * Global React Query provider SILAKAP
 * - Centralized error handling
 * - Retry strategy
 * - Cache control
 */
export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const e = error as HttpError
            const message =
              e?.message || "Terjadi kesalahan saat mengambil data"

            showToast(message, "error")
          },
        }),

        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const e = error as HttpError
            const message =
              e?.message || "Terjadi kesalahan saat memproses data"

            showToast(message, "error")
          },
        }),

        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 menit
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}