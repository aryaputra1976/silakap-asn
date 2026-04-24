// web/src/app/navigation/menu.filter.ts

import type { AppMenuItem } from "./menu.config"
import { hasService } from "@/features/services/base/registry"
import { hasAccess, type AccessContext } from "@/core/rbac/access"
import { hasRegisteredStaticRoute } from "@/app/routes/generateRoutes"

export type MenuAccessContext = AccessContext

function isSuperAdmin(context: MenuAccessContext): boolean {
  return (context.roles ?? []).some((role) => {
    const normalized = role.trim().toUpperCase()
    return normalized === "SUPER_ADMIN" || normalized === "SUPERADMIN"
  })
}

function canAccessMenuItem(
  item: AppMenuItem,
  context: MenuAccessContext
): boolean {
  if (isSuperAdmin(context)) {
    return true
  }

  return (
    hasAccess(
      {
        rolesAny: item.rolesAny,
        permissionAny: item.permissionAny
      },
      context
    ) && hasActiveMenuPath(item)
  )
}

function hasActiveMenuPath(item: AppMenuItem): boolean {
  if (!item.path) {
    return true
  }

  const match = item.path.match(/^\/layanan\/([^/]+)$/)

  if (!match) {
    return hasRegisteredStaticRoute(item.path)
  }

  return hasService(match[1])
}

function filterMenuTree(
  items: AppMenuItem[],
  context: MenuAccessContext
): AppMenuItem[] {
  const result: AppMenuItem[] = []

  for (const item of items) {
    const filteredChildren = item.children
      ? filterMenuTree(item.children, context)
      : undefined

    const selfVisible = canAccessMenuItem(item, context)
    const hasVisibleChildren = Boolean(filteredChildren && filteredChildren.length > 0)

    if (!selfVisible && !hasVisibleChildren) {
      continue
    }

    const nextItem: AppMenuItem = {
      key: item.key,
      title: item.title,
      path: item.path,
      icon: item.icon,
      permissionAny: item.permissionAny,
      rolesAny: item.rolesAny,
      badgeKey: item.badgeKey
    }

    if (hasVisibleChildren) {
      nextItem.children = filteredChildren
    }

    result.push(nextItem)
  }

  return result
}

export function filterMenuByAccess(
  items: AppMenuItem[],
  context: MenuAccessContext
): AppMenuItem[] {
  return filterMenuTree(items, context)
}

export function hasMenuAccess(
  item: AppMenuItem,
  context: MenuAccessContext
): boolean {
  return canAccessMenuItem(item, context)
}

export const filterMenu = filterMenuByAccess
