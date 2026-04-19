import { menuConfig } from "./menu.config"
import { MenuItem } from "./menu.types"

export function getBreadcrumb(pathname: string) {

  const breadcrumb: MenuItem[] = []

  function walk(items: MenuItem[], parent?: MenuItem) {

    for (const item of items) {

      if (item.path === pathname) {

        if (parent) breadcrumb.push(parent)

        breadcrumb.push(item)

        return true
      }

      if (item.children) {

        const found = walk(item.children, item)

        if (found) return true

      }

    }

    return false
  }

  walk(menuConfig)

  return breadcrumb
}