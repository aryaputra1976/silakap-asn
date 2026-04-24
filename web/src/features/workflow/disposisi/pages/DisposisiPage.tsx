import { useMemo, useState } from "react"
import { Navigate } from "react-router-dom"

import { KTIcon } from "@/_metronic/helpers"
import { PageTitle, type PageLink } from "@/_metronic/layout/core"
import { usePermission } from "@/core/rbac/usePermission"
import { PERMISSIONS } from "@/core/rbac/permissions"
import { useAuthStore } from "@/stores/auth.store"
import { WorkflowError } from "@/features/workflow/queue/components/WorkflowError"

import { DisposisiPagination } from "../components/DisposisiPagination"
import { DisposisiTable } from "../components/DisposisiTable"
import { DisposisiToolbar } from "../components/DisposisiToolbar"
import { useDisposisi } from "../hooks/useDisposisi"

const WORKFLOW_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Verifikasi & Persetujuan", path: "/workflow/disposisi", isActive: false },
]

export default function DisposisiPage() {
  const isLoadingAuth = useAuthStore((s) => s.isLoading)
  const can = usePermission()

  const [draftFilters, setDraftFilters] = useState({
    search: "",
    status: "",
  })

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  })

  const { data, isLoading, isError, error, refetch, isFetching } = useDisposisi(filters)

  const summary = useMemo(
    () => ({
      total: data?.meta.summary.total ?? 0,
      sent: data?.meta.summary.sent ?? 0,
      accepted: data?.meta.summary.accepted ?? 0,
      done: data?.meta.summary.done ?? 0,
    }),
    [data]
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
    }))
  }

  function resetFilters() {
    const cleared = {
      search: "",
      status: "",
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
      <PageTitle breadcrumbs={WORKFLOW_BREADCRUMBS}>Disposisi</PageTitle>

      <section className="card border-0 shadow-sm overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">Disposisi</div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Kelola penerusan pekerjaan antar role, pantau status disposisi yang masih
                berjalan, dan buka detail usulan yang perlu dilanjutkan.
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
              <KTIcon iconName="arrow-right-left" className="fs-1" />
            </div>
          </div>

          <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
            <div className="fw-semibold fs-6 mb-2">
              Gunakan halaman ini untuk melihat disposisi yang masih menunggu tindak lanjut,
              mengecek role tujuan, dan memastikan penerusan keputusan berjalan rapi.
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-light-primary">Total {summary.total}</span>
              <span className="badge badge-light-warning">Sent {summary.sent}</span>
              <span className="badge badge-light-info">Accepted {summary.accepted}</span>
              <span className="badge badge-light-success">Done {summary.done}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card border-0 shadow-sm">
        <div className="card-body pt-6">
          {isError ? (
            <WorkflowError
              message={error instanceof Error ? error.message : "Gagal memuat disposisi."}
            />
          ) : null}

          <DisposisiToolbar
            value={draftFilters}
            onChange={setDraftFilters}
            onApply={applyFilters}
            onReset={resetFilters}
          />

          <div className="row g-4 mb-6">
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Menunggu Tindak Lanjut
                </div>
                <div className="fw-bolder fs-1 text-warning mb-1">{summary.sent}</div>
                <div className="text-gray-600 fs-8">
                  Disposisi yang sudah dikirim dan masih menunggu langkah berikutnya.
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Sedang Diproses
                </div>
                <div className="fw-bolder fs-1 text-primary mb-1">{summary.accepted}</div>
                <div className="text-gray-600 fs-8">
                  Disposisi yang sudah diterima dan sedang dikerjakan pada role tujuan.
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100 d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Refresh Disposisi
                  </div>
                  <div className="text-gray-600 fs-8">
                    Muat ulang daftar untuk memastikan status disposisi sudah mengikuti data terbaru.
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

          <DisposisiTable data={data?.data ?? []} loading={isLoading} />

          <DisposisiPagination
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
