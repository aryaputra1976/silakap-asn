import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { KTIcon } from "@/_metronic/helpers"
import { PageTitle, type PageLink } from "@/_metronic/layout/core"
import httpClient from "@/core/http/httpClient"

const SECURITY_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Keamanan & Audit", path: "/keamanan/audit-log", isActive: false },
]

function formatDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function AuditListPage() {
  const [draftSearch, setDraftSearch] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["security", "audit", filters],
    queryFn: async ({ signal }) => {
      const response = await httpClient.get("/security/audit", {
        signal,
        params: filters,
      })
      return response.data as {
        data: Array<{
          id: string
          action: string
          entity: string
          entityId?: string | null
          createdAt: string
          user?: {
            id?: string | number
            username?: string
            email?: string
          } | null
        }>
        meta: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      }
    },
    placeholderData: (prev) => prev,
  })

  const total = data?.meta.total ?? 0

  function applySearch() {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: draftSearch.trim(),
    }))
  }

  function resetSearch() {
    setDraftSearch("")
    setFilters({
      page: 1,
      limit: 10,
      search: "",
    })
  }

  return (
    <div className="d-flex flex-column gap-7">
      <PageTitle breadcrumbs={SECURITY_BREADCRUMBS}>Audit Log</PageTitle>

      <section className="card border-0 shadow-sm overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">Audit Log</div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Tinjau jejak aksi penting di sistem, telusuri siapa melakukan perubahan, dan
                verifikasi kapan peristiwa keamanan atau administrasi terjadi.
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
              <KTIcon iconName="shield-tick" className="fs-1" />
            </div>
          </div>

          <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25 d-flex flex-wrap gap-2">
            <span className="badge badge-light-primary">Total Log {total}</span>
            <span className="badge badge-light-info">
              Gunakan pencarian untuk menelusuri action, entity, atau user
            </span>
          </div>
        </div>
      </section>

      <div className="card border-0 shadow-sm">
        <div className="card-body pt-6">
          {isError ? (
            <div className="alert alert-danger">
              <div className="fw-bold mb-2">Gagal memuat audit log</div>
              <div>{error instanceof Error ? error.message : "Terjadi kesalahan backend."}</div>
            </div>
          ) : null}

          <div className="rounded-4 border border-gray-200 bg-light-primary bg-opacity-10 px-5 py-5 mb-6">
            <div className="text-gray-900 fw-bold fs-5 mb-2">Filter Audit</div>
            <div className="text-muted fs-7 mb-4">
              Cari log berdasarkan action, entity, user, atau entity ID untuk mempercepat audit.
            </div>

            <div className="row g-4 align-items-end">
              <div className="col-12 col-xl-8">
                <label className="form-label fw-semibold">Cari Audit</label>
                <div className="d-flex gap-3">
                  <input
                    className="form-control"
                    placeholder="Masukkan action, entity, user, email, atau entity ID"
                    value={draftSearch}
                    onChange={(event) => setDraftSearch(event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary flex-shrink-0 text-nowrap"
                    style={{ minWidth: 110 }}
                    onClick={applySearch}
                  >
                    Cari
                  </button>
                  <button
                    type="button"
                    className="btn btn-light flex-shrink-0 text-nowrap"
                    style={{ minWidth: 110 }}
                    onClick={resetSearch}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100 d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                      Refresh Log
                    </div>
                    <div className="text-gray-600 fs-8">
                      Muat ulang daftar untuk melihat aktivitas audit terbaru.
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
          </div>

          {isLoading ? (
            <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center text-muted">
              Memuat audit log...
            </div>
          ) : !data?.data?.length ? (
            <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center">
              <div className="fw-bold text-gray-800 fs-4 mb-2">Tidak ada audit log yang cocok</div>
              <div className="text-muted fs-7">
                Coba ubah kata kunci pencarian untuk melihat log lain.
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-4">
                <thead>
                  <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 fw-semibold">
                  {data.data.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-gray-900">
                            {log.user?.username ?? "System"}
                          </span>
                          <span className="text-muted fs-7">{log.user?.email ?? "-"}</span>
                        </div>
                      </td>
                      <td>{log.action}</td>
                      <td>{log.entity}</td>
                      <td>{log.entityId ?? "-"}</td>
                      <td>{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.meta && data.meta.totalPages > 1 ? (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5">
              <div className="text-muted fs-7">
                Halaman {data.meta.page} dari {data.meta.totalPages} - Total {data.meta.total} log
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  disabled={data.meta.page <= 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  disabled={data.meta.page >= data.meta.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Berikutnya
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
