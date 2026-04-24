import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { usePermission } from "@/core/rbac/usePermission"
import { hasAccess } from "@/core/rbac/access"

interface Props {
  children: React.ReactElement
  permission?: string
  permissionAny?: string[]
  rolesAny?: string[]
}

export default function RouteGuard({
  children,
  permission,
  permissionAny,
  rolesAny
}: Props) {
  const location = useLocation()

  const { isAuthenticated, isLoading, roles, permissions } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
    roles: s.user?.roles ?? [],
    permissions: s.permissions ?? []
  }))

  const hasPermission = usePermission()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (
    ((rolesAny && rolesAny.length > 0) ||
      (permissionAny && permissionAny.length > 0)) &&
    !hasAccess(
      {
        rolesAny,
        permissionAny
      },
      {
        roles,
        permissions
      }
    )
  ) {
    return <Navigate to="/403" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  return children
}
