import { MenuItem } from "./menu.types"

export function flattenMenu(menu: MenuItem[]) {

  const result: MenuItem[] = []

  function walk(items: MenuItem[]) {

    for (const item of items) {

      result.push(item)

      if (item.children) {
        walk(item.children)
      }

    }

  }

  walk(menu)

  return result
}