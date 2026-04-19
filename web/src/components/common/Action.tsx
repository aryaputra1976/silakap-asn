import React from "react"
import Can from "@/core/rbac/Can"
import type { Permission } from "@/core/rbac/permissions"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission
  hideIfDenied?: boolean
}

/**
 * Tombol aksi RBAC-aware
 *
 * Default:
 * - kalau tidak punya izin → disabled
 * - bisa hide total pakai hideIfDenied
 */
export default function Action({
  permission,
  hideIfDenied,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <Can
      permission={permission}
      fallback={
        hideIfDenied ? null : (
          <button {...props} disabled className="btn btn-secondary">
            {children}
          </button>
        )
      }
    >
      <button {...props} disabled={disabled} className="btn btn-primary">
        {children}
      </button>
    </Can>
  )
}
