import { useMemo } from "react"
import { menuConfig, MenuItemConfig } from "./menu.config"
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

  // sementara superadmin
  const permissions = Object.values(PERMISSIONS) as string[]

  return useMemo(() => {
    return filterMenu(menuConfig, permissions)
  }, [])
}