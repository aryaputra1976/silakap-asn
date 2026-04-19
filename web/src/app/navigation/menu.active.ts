export function isMenuActive(pathname: string, path?: string) {

  if (!path) return false

  return pathname === path
}

export function isMenuParentActive(
  pathname: string,
  children?: { path?: string }[]
) {

  if (!children) return false

  return children.some((child) => {

    if (!child.path) return false

    return pathname === child.path || pathname.startsWith(child.path + "/")

  })
}