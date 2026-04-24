import { menuConfig } from "./menu.config"
import { MenuItem } from "./menu.types"

export interface SearchItem {
  id: string
  title: string
  path: string
  section?: string
  keywords: string[]
}

export function buildSearchIndex() {

  const result: SearchItem[] = []

  function walk(items: MenuItem[], parents: string[] = []) {

    for (const item of items) {
      const lineage = [...parents, item.title]

      if (item.path) {
        const keywords = new Set<string>()

        lineage.forEach((value) => {
          keywords.add(value.toLowerCase())
        })

        item.path
          .split("/")
          .map((part) => part.trim().toLowerCase())
          .filter(Boolean)
          .forEach((part) => keywords.add(part))

        result.push({
          id: `${item.path}-${item.title}`,
          title: item.title,
          path: item.path,
          section: parents[parents.length - 1],
          keywords: [...keywords],
        })

      }

      if (item.children) {
        walk(item.children, lineage)
      }

    }

  }

  walk(menuConfig)

  return result
}
