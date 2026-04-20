import { useAuthStore } from "@/stores/auth.store"
import { PERMISSIONS, type Permission } from "./permissions"

export function usePermission() {
  const permissions = useAuthStore((s) => s.permissions)
  const roles = useAuthStore((s) => s.user?.roles ?? [])

  return (perm?: Permission) => {
    if (!perm) return true

    const effectivePermissions = new Set(permissions ?? [])

    if (roles.includes("OPERATOR")) {
      effectivePermissions.add(PERMISSIONS.ASN_READ)
    }

    if (effectivePermissions.size === 0) return false

    return effectivePermissions.has(perm)
  }
}
