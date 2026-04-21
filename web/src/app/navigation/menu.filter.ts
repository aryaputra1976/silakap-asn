import { useMemo } from "react"
import { menuConfig, MenuItemConfig } from "./menu.config"
import { useAuthStore } from "@/stores/auth.store"
import { PERMISSIONS } from "@/core/rbac/permissions"

function filterMenu(
  items: MenuItemConfig[],
  permissions: string[],
  roles: string[]
): MenuItemConfig[] {
  return items
    .map((item) => {
      const hasRole =
        !item.roles ||
        item.roles.length === 0 ||
        item.roles.some((role) => roles.includes(role))

      if (!hasRole) {
        return null
      }

      const children = item.children
        ? filterMenu(item.children, permissions, roles)
        : undefined

      const hasPermission =
        !item.permission ||
        permissions.includes("*") ||
        permissions.includes(item.permission)

      if (hasPermission || (children && children.length > 0)) {
        return {
          ...item,
          children,
        }
      }

      return null
    })
    .filter(Boolean) as MenuItemConfig[]
}

export function useFilteredMenu() {
  const permissions = useAuthStore((state) => state.permissions)
  const roles = useAuthStore((state) => state.user?.roles ?? [])

  return useMemo(() => {
    const effectivePermissions = new Set(permissions)

    if (permissions.includes("*")) {
      effectivePermissions.add("*")
    }

    if (roles.includes("OPERATOR")) {
      effectivePermissions.add(PERMISSIONS.ASN_READ)
    }

    return filterMenu(
      menuConfig,
      Array.from(effectivePermissions),
      roles
    )
  }, [permissions, roles])
}
