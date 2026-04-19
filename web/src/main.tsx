import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "@/app/router"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// SILAKAP providers
import { AuthProvider } from "@/app/providers/AuthProvider"
import { RBACProvider } from "@/core/rbac/RBACProvider"
import { ToastProvider } from "@/core/toast/toast.provider"
import { showToast } from "@/core/toast/toast.hook"
import type { HttpError } from "@/core/http/httpError"
import { AppErrorBoundary } from "@/core/error/AppErrorBoundary"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// METRONIC layout
import { LayoutProvider } from "@/_metronic/layout/core/LayoutProvider"
import "@/_metronic/layout/core/LayoutSetup"

// styles
import "@/_metronic/assets/sass/style.scss"
import "@/_metronic/assets/keenicons/duotone/style.css"
import "@/_metronic/assets/keenicons/outline/style.css"
import "@/_metronic/assets/keenicons/solid/style.css"

import "@/styles/tree.css"

import "bootstrap/dist/js/bootstrap.bundle.min.js"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // 30 detik fresh
      gcTime: 1000 * 60 * 5,   // cache 5 menit
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      onSuccess: (data: any) => {
        const msg = data?.message
        if (msg) showToast(msg, "success")
      },
      onError: (error: unknown) => {
        const err = error as HttpError
        if (err?.message) showToast(err.message, "error")
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ToastProvider>
    <AppErrorBoundary>
      <AuthProvider>
        <RBACProvider>
          <QueryClientProvider client={queryClient}>
            <LayoutProvider>
              <Suspense fallback={null}>
                <RouterProvider router={router} />
              </Suspense>
            </LayoutProvider>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </RBACProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </ToastProvider>
)