import { Navigate } from "react-router-dom"

import { PageTitle, type PageLink } from "@/_metronic/layout/core"
import { KTIcon } from "@/_metronic/helpers"
import { usePermission } from "@/core/rbac/usePermission"
import { PERMISSIONS } from "@/core/rbac/permissions"
import { useAuthStore } from "@/stores/auth.store"
import ServiceStatusBadge from "@/features/services/base/components/ServiceStatusBadge"
import { WorkflowError } from "@/features/workflow/queue/components/WorkflowError"

import { WorkflowMonitoringCard } from "../components/WorkflowMonitoringCard"
import { useWorkflowMonitoring } from "../hooks/useWorkflowMonitoring"

const WORKFLOW_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Verifikasi & Persetujuan", path: "/workflow/monitoring", isActive: false },
]

function formatDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatAge(value?: string | null) {
  if (!value) return "-"

  const start = new Date(value).getTime()
  if (Number.isNaN(start)) return "-"

  const days = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)))
  if (days <= 0) return "Hari ini"
  if (days === 1) return "1 hari"
  return `${days} hari`
}

export default function MonitoringPage() {
  const isLoadingAuth = useAuthStore((s) => s.isLoading)
  const can = usePermission()
  const { data, isLoading, isError, error, refetch, isFetching } = useWorkflowMonitoring()

  if (isLoadingAuth) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!can(PERMISSIONS.SERVICE_VERIFY)) {
    return <Navigate to="/403" replace />
  }

  const sla = data?.sla ?? {
    overdue: 0,
    warning: 0,
    compliance: 100,
  }
  const bottleneck = data?.bottleneck ?? []
  const longestProcess = data?.longestProcess ?? []
  const activeCount = bottleneck.reduce((sum, item) => sum + item.total, 0)
  const densestStatus = bottleneck[0]

  return (
    <div className="d-flex flex-column gap-7">
      <PageTitle breadcrumbs={WORKFLOW_BREADCRUMBS}>Monitoring Workflow</PageTitle>

      <section className="card border-0 shadow-sm overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">Monitoring Workflow</div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Pantau kesehatan alur layanan yang sedang berjalan, lihat titik antrean yang
                menumpuk, dan identifikasi usulan yang paling lama masih terbuka.
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
              <KTIcon iconName="chart-line-up-2" className="fs-1" />
            </div>
          </div>

          <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
            <div className="fw-semibold fs-6 mb-2">
              Mulai dari status yang paling padat, lalu cek proses terlama untuk mendeteksi
              bottleneck sebelum usulan menumpuk terlalu lama.
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-light-primary">Proses Aktif {activeCount}</span>
              <span className="badge badge-light-danger">Overdue {sla.overdue}</span>
              <span className="badge badge-light-warning">Warning {sla.warning}</span>
              <span className="badge badge-light-success">Kepatuhan {sla.compliance}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card border-0 shadow-sm">
        <div className="card-body pt-6">
          {isError ? (
            <WorkflowError
              message={
                error instanceof Error
                  ? error.message
                  : "Gagal memuat monitoring workflow."
              }
            />
          ) : null}

          <div className="row g-4 mb-6">
            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Proses Aktif
                </div>
                <div className="fw-bolder fs-1 text-primary mb-1">{activeCount}</div>
                <div className="text-gray-600 fs-8">
                  Total usulan yang masih berjalan dan belum masuk status final.
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                  Status Terpadat
                </div>
                <div className="mb-2">
                  {densestStatus ? (
                    <ServiceStatusBadge status={densestStatus.status} />
                  ) : (
                    <span className="badge badge-light">Belum ada data</span>
                  )}
                </div>
                <div className="text-gray-600 fs-8">
                  {densestStatus
                    ? `${densestStatus.total} usulan sedang berkumpul pada status ini.`
                    : "Belum ada antrean aktif yang perlu dipantau."}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100 d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Refresh Monitoring
                  </div>
                  <div className="text-gray-600 fs-8">
                    Muat ulang data agar statistik dan proses terlama selalu mengikuti keadaan
                    terbaru.
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

          <div className="row g-5">
            <div className="col-12 col-xl-5">
              <div className="rounded-4 border border-gray-200 bg-light-primary bg-opacity-10 px-5 py-5 h-100">
                <div className="fw-bold text-gray-900 fs-5 mb-2">Ringkasan SLA</div>
                <div className="text-muted fs-7 mb-4">
                  Panel ini menunjukkan gambaran cepat kesehatan SLA pada workflow yang aktif.
                </div>

                <div className="row g-4">
                  <div className="col-12 col-md-4">
                    <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                      <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                        Overdue
                      </div>
                      <div className="fw-bolder fs-1 text-danger">{sla.overdue}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                      <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                        Warning
                      </div>
                      <div className="fw-bolder fs-1 text-warning">{sla.warning}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 h-100">
                      <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                        Kepatuhan
                      </div>
                      <div className="fw-bolder fs-1 text-success">{sla.compliance}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-7">
              <div className="rounded-4 border border-gray-200 bg-white px-5 py-5 h-100">
                <div className="fw-bold text-gray-900 fs-5 mb-2">Titik Bottleneck</div>
                <div className="text-muted fs-7 mb-4">
                  Status aktif dengan jumlah usulan terbanyak. Ini membantu melihat titik antrean
                  yang paling padat.
                </div>

                {isLoading ? (
                  <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center text-muted">
                    Memuat data monitoring...
                  </div>
                ) : bottleneck.length === 0 ? (
                  <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center">
                    <div className="fw-bold text-gray-800 fs-4 mb-2">Belum ada bottleneck aktif</div>
                    <div className="text-muted fs-7">
                      Saat ini belum ada usulan aktif yang perlu dipantau pada monitoring workflow.
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {bottleneck.map((item) => (
                      <div className="col-12 col-md-6" key={item.status}>
                        <WorkflowMonitoringCard item={item} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-4 border border-gray-200 bg-white px-5 py-5 mt-6">
            <div className="fw-bold text-gray-900 fs-5 mb-2">Proses Terlama</div>
            <div className="text-muted fs-7 mb-4">
              Daftar usulan aktif yang paling lama masih terbuka. Gunakan ini untuk memprioritaskan
              pemeriksaan lanjutan.
            </div>

            {isLoading ? (
              <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center text-muted">
                Memuat proses terlama...
              </div>
            ) : longestProcess.length === 0 ? (
              <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center">
                <div className="fw-bold text-gray-800 fs-4 mb-2">Belum ada proses aktif</div>
                <div className="text-muted fs-7">
                  Tidak ada usulan aktif yang perlu ditampilkan pada daftar proses terlama.
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-row-dashed fs-6 gy-4">
                  <thead>
                    <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                      <th>ASN</th>
                      <th>Layanan</th>
                      <th>Status</th>
                      <th>Diajukan</th>
                      <th>Aging</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 fw-semibold">
                    {longestProcess.map((item) => (
                      <tr key={item.id}>
                        <td>{item.pegawai?.nama ?? "-"}</td>
                        <td>{item.jenis?.nama ?? "-"}</td>
                        <td>
                          <ServiceStatusBadge status={item.status} />
                        </td>
                        <td>{formatDate(item.tanggalUsul)}</td>
                        <td>{formatAge(item.tanggalUsul)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
