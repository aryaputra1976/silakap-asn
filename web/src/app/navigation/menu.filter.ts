import { useMemo } from "react"
import { menuConfig, MenuItemConfig } from "./menu.config"
import { useAuthStore } from "@/stores/auth.store"
import { PERMISSIONS } from "@/core/rbac/permissions"

function filterMenu(
  items: MenuItemConfig[],
  permissions: string[]
): MenuItemConfig[] {

  return items
    .map((item) => {

      const children = item.children
        ? filterMenu(item.children, permissions)
        : undefined

      const hasPermission =
        !item.permission || permissions.includes(item.permission)

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
    if (permissions.includes("*")) {
      return menuConfig
    }

    const effectivePermissions = new Set(permissions)

    if (roles.includes("OPERATOR")) {
      effectivePermissions.add(PERMISSIONS.ASN_READ)
    }

    return filterMenu(menuConfig, Array.from(effectivePermissions))
  }, [permissions, roles])
}
