// web/src/_metronic/layout/components/aside/AsideMenu.tsx

import React, { useMemo } from "react"
import { AsideMenuMain } from "./AsideMenuMain"
import { useAuthStore } from "@/stores/auth.store"

type AuthLikeUser = {
  role?: string
  roles?: string[]
}

function normalizeRoles(user: AuthLikeUser | null): string[] {
  if (!user) {
    return []
  }

  if (Array.isArray(user.roles)) {
    return user.roles.filter(Boolean)
  }

  if (typeof user.role === "string" && user.role.trim().length > 0) {
    return [user.role]
  }

  return []
}

export function AsideMenu(): React.ReactElement {
  const currentUser = useAuthStore((state) => state.user)
  const authPermissions = useAuthStore((state) => state.permissions)

  const roles = useMemo(() => normalizeRoles(currentUser), [currentUser])
  const permissions = useMemo(() => {
    if (Array.isArray(authPermissions)) {
      return authPermissions.filter(Boolean)
    }

    return []
  }, [authPermissions])

  return (
    <div className="aside-menu flex-column-fluid h-100 min-h-100 d-flex flex-column">
      <div
        id="kt_aside_menu_wrapper"
        className="aside-menu-scroll hover-scroll-overlay-y h-100 my-2 my-lg-4 pe-2 flex-grow-1"
        data-kt-scroll="true"
        data-kt-scroll-activate="{default: false, lg: true}"
        data-kt-scroll-height="auto"
        data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_toolbar, #kt_aside_footer"
        data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu"
        data-kt-scroll-offset="8px"
      >
        <AsideMenuMain roles={roles} permissions={permissions} />
      </div>
    </div>
  )
}

export default AsideMenu
