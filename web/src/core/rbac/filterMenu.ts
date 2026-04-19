import type { MenuItemConfig } from "@/app/navigation/menu.config"

/**
 * Cek apakah user punya permission
 */
function hasPermission(
  userPermissions: string[],
  required?: string
): boolean {
  if (!required) return true
  return userPermissions.includes(required)
}

/**
 * Recursive filter menu berdasarkan permission
 */
export function filterMenuByPermission(
  menu: MenuItemConfig[],
  userPermissions: string[]
): MenuItemConfig[] {
  const result: MenuItemConfig[] = []

  for (const item of menu) {
    // cek permission item ini
    if (!hasPermission(userPermissions, item.permission)) continue

    // clone supaya tidak mutate config asli
    const newItem: MenuItemConfig = { ...item }

    // kalau punya children → filter juga
    if (item.children) {
      newItem.children = filterMenuByPermission(
        item.children,
        userPermissions
      )
    }

    // kalau parent tanpa children setelah filter → sembunyikan
    if (newItem.children && newItem.children.length === 0 && !newItem.path) {
      continue
    }

    result.push(newItem)
  }

  return result
}