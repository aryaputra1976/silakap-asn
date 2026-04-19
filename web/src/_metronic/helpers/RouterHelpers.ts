export function getCurrentUrl(pathname: string) {
  return pathname.split(/[?#]/)[0]
}

export function checkIsActive(pathname: string, url: string) {
  const current = getCurrentUrl(pathname)

  if (!current || !url) {
    return false
  }

  // exact match
  if (current === url) {
    return true
  }

  // nested route
  if (current.startsWith(url + '/')) {
    return true
  }

  return false
}