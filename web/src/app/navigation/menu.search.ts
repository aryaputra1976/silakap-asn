import { menuConfig } from "./menu.config"
import { MenuItem } from "./menu.types"

export interface SearchItem {
  title: string
  path: string
}

export function buildSearchIndex() {

  const result: SearchItem[] = []

  function walk(items: MenuItem[]) {

    for (const item of items) {

      if (item.path) {

        result.push({
          title: item.title,
          path: item.path,
        })

      }

      if (item.children) {
        walk(item.children)
      }

    }

  }

  walk(menuConfig)

  return result
}