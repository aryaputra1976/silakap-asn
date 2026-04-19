import { createContext, useContext, useMemo } from "react"
import { useAuthStore } from "@/stores/auth.store"
import type { RBACContextValue, Permission } from "./types"

const RBACContext = createContext<RBACContextValue | null>(null)

export function RBACProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const permissions = useAuthStore((s) => s.permissions)

  const value = useMemo<RBACContextValue>(() => {
    return {
      permissions,

      has: (perm: Permission) => {
        if (permissions.includes("*")) return true
        return permissions.includes(perm)
      },

      any: (perms: Permission[]) => {
        if (permissions.includes("*")) return true
        return perms.some((p) => permissions.includes(p))
      },
    }
  }, [permissions])

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const ctx = useContext(RBACContext)
  if (!ctx) throw new Error("RBACProvider not mounted")
  return ctx
}