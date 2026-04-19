import { MenuItem } from "./menu.types"

export interface RouteItem {
  path: string
}

export function generateRoutes(menu: MenuItem[]): RouteItem[] {

  const routes: RouteItem[] = []

  function walk(items: MenuItem[]) {

    for (const item of items) {

      if (item.path) {
        routes.push({ path: item.path })
      }

      if (item.children) {
        walk(item.children)
      }

    }

  }

  walk(menu)

  return routes
}