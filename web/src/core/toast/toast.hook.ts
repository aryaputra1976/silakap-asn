import { useToastStore } from "./toast.store"
import type { ToastType } from "./toast.types"

/* ========= dipakai di NON-React code (httpClient, service) ========= */
export function showToast(message: string, type: ToastType = "info") {
  useToastStore.getState().push({ message, type })
}

/* ========= dipakai di React component ========= */
export function useToast() {
  const push = useToastStore((s) => s.push)

  return {
    success: (msg: string) => push({ message: msg, type: "success" }),
    error: (msg: string) => push({ message: msg, type: "error" }),
    info: (msg: string) => push({ message: msg, type: "info" }),
    warning: (msg: string) => push({ message: msg, type: "warning" }),
  }
}
