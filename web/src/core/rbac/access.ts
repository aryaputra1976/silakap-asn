export type AccessContext = {
  roles?: string[]
  permissions?: string[]
}

export type AccessRule = {
  rolesAny?: string[]
  permissionAny?: string[]
}

function normalizeValue(value: string): string {
  return value.trim().toUpperCase()
}

function toNormalizedSet(values?: string[]): Set<string> {
  return new Set((values ?? []).filter(Boolean).map(normalizeValue))
}

function hasAnyMatch(source: Set<string>, required?: string[]): boolean {
  if (!required || required.length === 0) {
    return true
  }

  return required.some((value) => source.has(normalizeValue(value)))
}

function isSuperAdmin(roleSet: Set<string>): boolean {
  return roleSet.has("SUPER_ADMIN") || roleSet.has("SUPERADMIN")
}

export function hasAccess(
  rule: AccessRule,
  context: AccessContext
): boolean {
  const roleSet = toNormalizedSet(context.roles)
  const permissionSet = toNormalizedSet(context.permissions)

  if (isSuperAdmin(roleSet)) {
    return true
  }

  const hasRoleRule = Boolean(rule.rolesAny && rule.rolesAny.length > 0)
  const hasPermissionRule = Boolean(
    rule.permissionAny && rule.permissionAny.length > 0
  )

  if (!hasRoleRule && !hasPermissionRule) {
    return true
  }

  const roleAllowed = hasAnyMatch(roleSet, rule.rolesAny)
  const permissionAllowed = hasAnyMatch(permissionSet, rule.permissionAny)

  return roleAllowed && permissionAllowed
}
