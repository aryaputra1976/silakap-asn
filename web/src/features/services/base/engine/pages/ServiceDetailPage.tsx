import { Link, Navigate, useParams } from "react-router-dom"

import { useAuthStore } from "@/stores/auth.store"

import ServiceTimeline from "../../components/ServiceTimeline"
import DocumentList from "../../documents/components/DocumentList"
import { getServiceDocuments } from "../../documents/document.engine"
import { hasService } from "../../registry"
import WorkflowActions from "../../workflow/WorkflowActions"
import { UserRole } from "../../workflow/role.config"
import { workflowDispatcher } from "../../workflow/workflow.dispatcher"

import { useServiceDetail } from "../hooks/useServiceDetail"

function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  return new Intl.NumberFormat("id-ID").format(Number(value))
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("id-ID")
}

export default function ServiceDetailPage() {
  const params = useParams<{ service: string; id: string }>()

  if (!params.service || !params.id) {
    return <Navigate to="/dashboard" replace />
  }

  const service = params.service
  const id = params.id
  const isRegistered = hasService(service)
  const { data, loading, reload } = useServiceDetail(
    service,
    id,
    isRegistered,
  )

  if (!isRegistered) {
    return <Navigate to="/dashboard" replace />
  }

  const authRoles =
    useAuthStore((state) => state.user?.roles ?? [])

  if (loading) {
    return <div className="text-center py-10">Memuat data...</div>
  }

  if (!data) {
    return (
      <div className="alert alert-warning">
        Data tidak ditemukan
      </div>
    )
  }

  const detail = data
  const normalizedRoles = authRoles.map((role) =>
    role.toUpperCase(),
  )

  const userRole: UserRole = normalizedRoles.includes("SUPER_ADMIN")
    ? "SUPER_ADMIN"
    : normalizedRoles.includes("ADMIN_BKPSDM")
      ? "ADMIN_BKPSDM"
      : normalizedRoles.includes("PPK")
        ? "PPK"
        : normalizedRoles.includes("OPERATOR")
          ? "OPERATOR"
          : normalizedRoles.includes("ASN")
            ? "ASN"
            : normalizedRoles.includes("VERIFIKATOR")
              ? "VERIFIKATOR"
              : "ASN"

  const availableActions = (detail.availableActions ?? [])
    .filter((action) => {
      if (!action.role) {
        return true
      }

      return normalizedRoles.includes(action.role.toUpperCase())
    })
    .map((action) => action.actionCode.toLowerCase())

  const hasValidNip =
    detail.nip.trim().length > 0 && detail.nip !== "-"

  async function handleAction(action: string) {
    try {
      await workflowDispatcher(service, detail.id, action)
      alert("Aksi berhasil")
      await reload()
    } catch (err) {
      console.error(err)
      alert("Aksi gagal")
    }
  }

  const documents = getServiceDocuments(service)
  const checkedChecklistCount = detail.checklistItems.filter(
    (item) => item.isChecked,
  ).length
  const unresolvedIssuesCount = detail.validationIssues.filter(
    (item) => !item.isResolved,
  ).length

  return (
    <div className="container-fluid">
      <div className="card mb-5">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1">Detail Layanan</h3>
            <div className="text-muted small">
              {detail.nama} - {detail.nip}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link
              to={
                hasValidNip
                  ? `/dms-monitoring?nip=${encodeURIComponent(detail.nip)}`
                  : "/dms-monitoring"
              }
              className="btn btn-light-primary"
            >
              Lihat DMS
            </Link>

            <WorkflowActions
              status={detail.status}
              role={userRole}
              actions={availableActions}
              onAction={handleAction}
            />
          </div>
        </div>
      </div>

      <div className="row g-5 mb-5">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted fs-7 mb-1">Status</div>
              <div className="fw-bold fs-4">{detail.status}</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted fs-7 mb-1">Step Aktif</div>
              <div className="fw-bold fs-4">
                {detail.currentStepCode ?? "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted fs-7 mb-1">Checklist</div>
              <div className="fw-bold fs-4">
                {checkedChecklistCount}/{detail.checklistItems.length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted fs-7 mb-1">Issue Validasi</div>
              <div className="fw-bold fs-4">{unresolvedIssuesCount}</div>
            </div>
          </div>
        </div>
      </div>

      {detail.pensiunDetail && (
        <div className="card mb-5">
          <div className="card-header">
            <h4 className="mb-0">Ringkasan Pensiun</h4>
          </div>

          <div className="card-body">
            <div className="row g-5">
              <div className="col-md-4">
                <div className="text-muted fs-7">Jenis Pensiun</div>
                <div className="fw-semibold">
                  {detail.pensiunDetail.jenis?.nama ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">TMT Pensiun</div>
                <div className="fw-semibold">
                  {detail.pensiunDetail.tmtPensiun
                    ? new Date(
                        detail.pensiunDetail.tmtPensiun,
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Golongan Snapshot</div>
                <div className="fw-semibold">
                  {detail.pensiunDetail.golonganSnapshot ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Jabatan Snapshot</div>
                <div className="fw-semibold">
                  {detail.pensiunDetail.jabatanSnapshot ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Unit Kerja Snapshot</div>
                <div className="fw-semibold">
                  {detail.pensiunDetail.unitKerjaSnapshot ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Estimasi Pensiun</div>
                <div className="fw-semibold">
                  {formatMoney(
                    detail.pensiunDetail.perhitungan?.estimasiPensiun,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detail.jabatanDetail && (
        <div className="card mb-5">
          <div className="card-header">
            <h4 className="mb-0">Ringkasan Jabatan</h4>
          </div>

          <div className="card-body">
            <div className="row g-5">
              <div className="col-md-4">
                <div className="text-muted fs-7">Jenis Jabatan Usulan</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.proposedJenisJabatan ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Jabatan Usulan</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.proposedJabatan ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">TMT Jabatan Usulan</div>
                <div className="fw-semibold">
                  {formatDate(detail.jabatanDetail.proposedTmtJabatan)}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Nomor SK Usulan</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.proposedNomorSk ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Jabatan Aktif Saat Ini</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.currentJabatan ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">TMT Jabatan Aktif</div>
                <div className="fw-semibold">
                  {formatDate(detail.jabatanDetail.currentTmtJabatan)}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Jenis Jabatan Aktif</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.currentJenisJabatan ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Nomor SK Aktif</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.currentNomorSk ?? "-"}
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-muted fs-7">Status Apply Domain</div>
                <div className="fw-semibold">
                  {detail.jabatanDetail.isApplied
                    ? "Sudah diterapkan"
                    : "Menunggu approval"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="card mb-5">
            <div className="card-header">
              <h4 className="mb-0">Dokumen</h4>
            </div>

            <div className="card-body">
              <DocumentList
                configs={documents}
                service={service}
                id={id}
              />
            </div>
          </div>

          <div className="card mb-5">
            <div className="card-header">
              <h4 className="mb-0">Checklist</h4>
            </div>

            <div className="card-body">
              {detail.checklistItems.length === 0 ? (
                <div className="text-muted">Belum ada checklist</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.checklistItems.map((item) => (
                        <tr key={item.itemCode}>
                          <td>{item.itemLabel}</td>
                          <td>{item.itemCategory ?? "-"}</td>
                          <td>{item.note ?? "-"}</td>
                          <td>
                            {item.isChecked ? "Checked" : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Issue Validasi</h4>
            </div>

            <div className="card-body">
              {detail.validationIssues.length === 0 ? (
                <div className="text-muted">
                  Tidak ada issue validasi
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Issue</th>
                        <th>Severity</th>
                        <th>Sumber</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.validationIssues.map((item) => (
                        <tr key={item.issueCode}>
                          <td>{item.issueLabel}</td>
                          <td>{item.severity}</td>
                          <td>{item.source}</td>
                          <td>
                            {item.isResolved
                              ? "Resolved"
                              : "Open"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Timeline Proses</h4>
            </div>

            <div className="card-body">
              <ServiceTimeline timeline={detail.timeline ?? []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
