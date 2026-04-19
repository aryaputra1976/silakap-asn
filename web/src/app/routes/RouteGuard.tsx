import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { usePermission } from "@/core/rbac/usePermission"
import type { Permission } from "@/core/rbac/permissions"

interface Props {
  children: React.ReactElement
  permission?: Permission
}

export default function RouteGuard({ children, permission }: Props) {
  const location = useLocation()

  const { isAuthenticated, isLoading } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading, // ← penting untuk async auth
  }))

  
const hasPermission = usePermission()
  /**
   * 0️⃣ Tunggu auth resolve dulu
   */
  if (isLoading) {
    return null // nanti bisa diganti splash screen
  }

  /**
   * 1️⃣ Belum login → ke login
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  /**
   * 2️⃣ Tidak punya permission → ke 403
   */
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  /**
   * 3️⃣ Aman → render halaman
   */
  return children
}