import { PropsWithChildren } from "react"
import { QueryProvider } from "./QueryProvider"
import { AuthProvider } from "./AuthProvider"
import { ToastProvider } from "@/core/toast/toast.provider"
import { ConfirmProvider } from "@/components/common/confirm/ConfirmProvider"
console.log("APPPROVIDER : SHOW TOAST DIPANGGIL:") // ← debug
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ConfirmProvider>
          <ToastProvider>
          {children}
          </ToastProvider>
        </ConfirmProvider>
      </AuthProvider>
    </QueryProvider>
  )
}