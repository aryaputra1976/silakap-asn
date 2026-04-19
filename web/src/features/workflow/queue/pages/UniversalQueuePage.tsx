import { useState } from "react"
import { Navigate } from "react-router-dom"

import { useUniversalQueue } from "../hooks/useUniversalQueue"
import { UniversalQueueToolbar } from "../components/UniversalQueueToolbar"
import { UniversalQueueTable } from "../components/UniversalQueueTable"
import { UniversalQueuePagination } from "../components/UniversalQueuePagination"
import { WorkflowError } from "../components/WorkflowError"

import { usePermission } from "@/core/rbac/usePermission"
import { PERMISSIONS } from "@/core/rbac/permissions"
import { useAuthStore } from "@/stores/auth.store"

export default function UniversalQueuePage() {

  const isLoadingAuth = useAuthStore((s) => s.isLoading)

  const can = usePermission()

  if (isLoadingAuth) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!can(PERMISSIONS.SERVICE_VERIFY)) {
    return <Navigate to="/403" replace />
  }

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    jenis: "",
  })

  const { data, isLoading, isError } =
    useUniversalQueue(filters)

  return (
    <div className="card">

      <div className="card-header border-0 pt-6">
        <h3 className="card-title">Antrian Verifikasi</h3>
      </div>

      <div className="card-body pt-0">

        {isError && (
          <WorkflowError message="Gagal memuat antrian layanan." />
        )}

        <UniversalQueueToolbar
          onChange={(newFilters) =>
            setFilters((prev) => ({
              ...prev,
              ...newFilters,
              page: 1,
            }))
          }
        />

        <UniversalQueueTable
          data={data?.data ?? []}
          loading={isLoading}
        />

        <UniversalQueuePagination
          meta={data?.meta}
          onChange={(page) =>
            setFilters((prev) => ({ ...prev, page }))
          }
        />

      </div>

    </div>
  )
}