import { useMemo, useState } from "react"
import { Navigate } from "react-router-dom"

import { PageTitle, type PageLink } from "@/_metronic/layout/core"
import { KTIcon } from "@/_metronic/helpers"
import { usePermission } from "@/core/rbac/usePermission"
import { PERMISSIONS } from "@/core/rbac/permissions"
import { useAuthStore } from "@/stores/auth.store"

import { useUniversalQueue } from "../hooks/useUniversalQueue"
import { UniversalQueueToolbar } from "../components/UniversalQueueToolbar"
import { UniversalQueueTable } from "../components/UniversalQueueTable"
import { UniversalQueuePagination } from "../components/UniversalQueuePagination"
import { WorkflowError } from "../components/WorkflowError"

const WORKFLOW_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Verifikasi & Persetujuan", path: "/workflow/queue", isActive: false },
]

export default function UniversalQueuePage() {
  const isLoadingAuth = useAuthStore((s) => s.isLoading)
  const can = usePermission()

  const [draftFilters, setDraftFilters] = useState({
    search: "",
    status: "",
    jenis: "",
  })

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    jenis: "",
  })

  const { data, isLoading, isError, error, refetch, isFetching } =
    useUniversalQueue(filters)

  const summary = useMemo(
    () => ({
      total: data?.meta.summary.total ?? 0,
      overdue: data?.meta.summary.overdue ?? 0,
      seniorReview: data?.meta.summary.seniorReview ?? 0,
    }),
    [data],
  )

  if (isLoadingAuth) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!can(PERMISSIONS.SERVICE_VERIFY)) {
    return <Navigate to="/403" replace />
  }

  function applyFilters() {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: draftFilters.search.trim(),
      status: draftFilters.status,
      jenis: draftFilters.jenis,
    }))
  }

  function resetFilters() {
    const cleared = {
      search: "",
      status: "",
      jenis: "",
    }

    setDraftFilters(cleared)
    setFilters({
      page: 1,
      limit: 10,
      ...cleared,
    })
  }

  return (
    <div className="d-flex flex-column gap-7">
      <PageTitle breadcrumbs={WORKFLOW_BREADCRUMBS}>Antrian Verifikasi</PageTitle>

      <section className="card border-0 shadow-sm overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">Antrian Verifikasi</div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Workspace utama untuk memproses usulan yang menunggu review, melihat
                prioritas, dan membuka detail layanan yang perlu segera ditindaklanjuti.
              </div>
            </div>

            <div
              className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 68,
                height: 68,
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
              }}
            >
              <KTIcon iconName="verify" className="fs-1" />
            </div>
          </div>

          <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
            <div className="fw-semibold fs-6 mb-2">
              Fokuskan pekerjaan dari antrian yang benar-benar menunggu aksi Anda, lalu
              buka detail usulan untuk verify, return, atau lanjutkan keputusan.
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-light-primary">Total Queue {summary.total}</span>
              <span className="badge badge-light-danger">Overdue {summary.overdue}</span>
              <span className="badge badge-light-warning">
                Senior Review {summary.seniorReview}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="card border-0 shadow-sm">
        <div className="card-body pt-6">
          {isError ? (
            <WorkflowError
              message={error instanceof Error ? error.message : "Gagal memuat antrian layanan."}
            />
          ) : null}

          <UniversalQueueToolbar
            value={draftFilters}
            serviceOptions={data?.meta.serviceOptions ?? []}
            onChange={setDraftFilters}
            onApply={applyFilters}
            onReset={resetFilters}
          />

          <div className="row g-4 mb-6">
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Usulan Dalam Queue
                </div>
                <div className="fw-bolder fs-1 text-primary mb-1">{summary.total}</div>
                <div className="text-gray-600 fs-8">
                  Jumlah usulan yang cocok dengan filter aktif.
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Perlu Perhatian
                </div>
                <div className="fw-bolder fs-1 text-danger mb-1">{summary.overdue}</div>
                <div className="text-gray-600 fs-8">
                  Usulan yang sudah melewati SLA dan perlu diprioritaskan.
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100 d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Refresh Data
                  </div>
                  <div className="text-gray-600 fs-8">
                    Muat ulang antrian untuk memastikan status terbaru sudah masuk.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-light-primary btn-sm"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  {isFetching ? "Memuat..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

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
    </div>
  )
}
