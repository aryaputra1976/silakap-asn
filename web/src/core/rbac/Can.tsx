import React from "react"
import { usePermission } from "./usePermission"
import type { Permission } from "./permissions"

interface Props {
  permission?: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function Can({ permission, children, fallback = null }: Props) {
  const hasPermission = usePermission()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
