export type Permission = string

export interface RBACContextValue {
  permissions: Permission[]

  has: (perm: Permission) => boolean
  any: (perms: Permission[]) => boolean
}