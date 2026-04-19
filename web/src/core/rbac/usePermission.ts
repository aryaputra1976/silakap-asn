import { useAuthStore } from "@/stores/auth.store"
import type { Permission } from "./permissions"

export function usePermission() {
  const permissions = useAuthStore((s) => s.permissions)

  return (perm?: Permission) => {
    if (!perm) return true
    if (!permissions?.length) return false
    return permissions.includes(perm)
  }
}