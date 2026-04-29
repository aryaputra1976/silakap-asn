import { useQuery } from "@tanstack/react-query"
import {
  getIntegrasiSiasnStatus,
  getIntegrasiSiasnSummary,
} from "../api/integrasi.api"
import { ImportStatusBadge } from "../components/import/ImportStatusBadge"
import { formatNumber } from "../components/import/import-ui"

const HEALTH_CLASS: Record<string, string> = {
  HEALTHY: "badge-light-success",
  PARTIAL: "badge-light-primary",
  WARNING: "badge-light-warning",
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function HealthBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase()
  const badgeClass = HEALTH_CLASS[normalizedStatus] ?? "badge-light-dark"

  return (
    <span className={`badge ${badgeClass}`}>
      {normalizedStatus.replace(/_/g, " ")}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "dark",
}: {
  label: string
  value: number | string
  hint: string
  tone?: "primary" | "success" | "warning" | "danger" | "dark"
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : tone === "warning"
          ? "text-warning"
          : tone === "danger"
            ? "text-danger"
            : "text-gray-900"

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body py-6">
        <div className="fs-8 text-gray-500 text-uppercase fw-semibold mb-2">
          {label}
        </div>
        <div className={`fs-2hx fw-bolder ${toneClass}`}>{value}</div>
        <div className="fs-7 text-gray-600 mt-1">{hint}</div>
      </div>
    </div>
  )
}

export default function IntegrasiSiasnPage() {
  const summary = useQuery({
    queryKey: ["integrasi", "siasn-summary"],
    queryFn: ({ signal }) => getIntegrasiSiasnSummary({ signal }),
  })

  const status = useQuery({
    queryKey: ["integrasi", "siasn-status"],
    queryFn: ({ signal }) => getIntegrasiSiasnStatus({ signal }),
  })

  const coverage = summary.data?.pegawai.siasnCoveragePercent ?? 0
  const safeCoverage = Math.min(100, Math.max(0, coverage))

  return (
    <div className="container-fluid">
      <div className="card border-0 shadow-sm mb-7 overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">
                Sinkronisasi SIASN
              </div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Monitoring cakupan SIASN ID, status sinkronisasi, dan kondisi
                batch import pegawai.
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <span className="badge badge-light-primary">SIASN Coverage</span>
                <span className="badge badge-light-success">Pegawai Terkoneksi</span>
                <span className="badge badge-light-warning">Data Belum Lengkap</span>
              </div>
            </div>

            <div className="rounded-4 px-5 py-4 text-white border border-white border-opacity-25 min-w-lg-250px">
              <div className="fs-8 text-white opacity-75 text-uppercase fw-semibold mb-2">
                Health Status
              </div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <HealthBadge status={status.data?.status ?? "UNKNOWN"} />
                <span className="fs-8 opacity-75">
                  {formatDate(status.data?.checkedAt)}
                </span>
              </div>
              <div className="fs-7 opacity-75">
                {status.data?.message ?? "Status sinkronisasi belum tersedia."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Total Pegawai"
            value={formatNumber(summary.data?.pegawai.total ?? 0)}
            hint="Pegawai aktif dan nonaktif"
            tone="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Punya SIASN ID"
            value={formatNumber(summary.data?.pegawai.withSiasnId ?? 0)}
            hint="Data sudah terhubung SIASN"
            tone="success"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Belum SIASN ID"
            value={formatNumber(summary.data?.pegawai.withoutSiasnId ?? 0)}
            hint="Butuh sinkronisasi lanjutan"
            tone="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Coverage"
            value={`${safeCoverage}%`}
            hint="Persentase kepemilikan SIASN ID"
            tone="dark"
          />
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <div className="card-title flex-column align-items-start">
                <h3 className="fw-bold text-gray-900 mb-1">Cakupan SIASN</h3>
                <div className="text-gray-600 fs-7">
                  Persentase pegawai yang sudah memiliki SIASN ID.
                </div>
              </div>

              <div className="card-toolbar">
                <HealthBadge status={summary.data?.sync.status ?? "UNKNOWN"} />
              </div>
            </div>

            <div className="card-body pt-2">
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-gray-600 fs-7 fw-semibold">
                    Pegawai dengan SIASN ID
                  </span>
                  <span className="text-gray-900 fs-7 fw-bold">
                    {safeCoverage}%
                  </span>
                </div>

                <div className="progress h-10px bg-light">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${safeCoverage}%` }}
                    aria-valuenow={safeCoverage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>

              <div className="row g-4">
                <div className="col-6">
                  <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100">
                    <div className="fs-8 text-gray-500 text-uppercase fw-semibold mb-2">
                      Pegawai Aktif
                    </div>
                    <div className="fw-bolder fs-2 text-success">
                      {formatNumber(summary.data?.pegawai.active ?? 0)}
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100">
                    <div className="fs-8 text-gray-500 text-uppercase fw-semibold mb-2">
                      Pegawai Nonaktif
                    </div>
                    <div className="fw-bolder fs-2 text-gray-900">
                      {formatNumber(summary.data?.pegawai.inactive ?? 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded border border-gray-300 border-dashed bg-light-primary bg-opacity-10 px-5 py-4 mt-5">
                <div className="fw-bold text-gray-900 fs-6 mb-1">
                  Interpretasi Coverage
                </div>
                <div className="text-gray-600 fs-7 lh-lg">
                  Semakin tinggi coverage, semakin kecil risiko data pegawai
                  tidak terhubung dengan referensi SIASN.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <div className="card-title flex-column align-items-start">
                <h3 className="fw-bold text-gray-900 mb-1">
                  Sinkronisasi Terakhir
                </h3>
                <div className="text-gray-600 fs-7">
                  Pegawai terakhir yang tercatat memiliki aktivitas sinkronisasi.
                </div>
              </div>
            </div>

            <div className="card-body pt-2">
              {summary.data?.sync.latestSyncedPegawai ? (
                <div className="d-flex flex-column gap-5">
                  <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                    <div className="fw-bold text-gray-900 fs-5">
                      {summary.data.sync.latestSyncedPegawai.nama}
                    </div>
                    <div className="text-gray-600 fs-7 mt-1">
                      NIP: {summary.data.sync.latestSyncedPegawai.nip}
                    </div>
                    <div className="text-gray-500 fs-8 mt-1">
                      SIASN ID:{" "}
                      {summary.data.sync.latestSyncedPegawai.siasnId ?? "-"}
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="rounded bg-light px-5 py-4 h-100">
                        <div className="fs-8 text-gray-500 text-uppercase fw-semibold mb-2">
                          Last Synced
                        </div>
                        <div className="fw-bold text-gray-900 fs-7">
                          {formatDate(
                            summary.data.sync.latestSyncedPegawai.lastSyncedAt,
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="rounded bg-light px-5 py-4 h-100">
                        <div className="fs-8 text-gray-500 text-uppercase fw-semibold mb-2">
                          Source
                        </div>
                        <div className="fw-bold text-gray-900 fs-7">
                          {summary.data.sync.latestSyncedPegawai.syncSource ??
                            "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded border border-gray-300 border-dashed px-5 py-10 text-center">
                  <div className="fw-bold text-gray-900 fs-5 mb-1">
                    Belum ada sinkronisasi
                  </div>
                  <div className="text-gray-600 fs-7">
                    Data pegawai terakhir yang tersinkron belum tersedia.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 pt-6">
          <div className="card-title flex-column align-items-start">
            <h3 className="fw-bold text-gray-900 mb-1">
              Batch Import Terakhir
            </h3>
            <div className="text-gray-600 fs-7">
              Ringkasan batch terakhir yang berpengaruh pada data integrasi.
            </div>
          </div>

          <div className="card-toolbar">
            <span className="badge badge-light-danger">
              Failed: {formatNumber(summary.data?.sync.failedImportBatches ?? 0)}
            </span>
            <span className="badge badge-light-success ms-2">
              Imported:{" "}
              {formatNumber(summary.data?.sync.importedBatches ?? 0)}
            </span>
          </div>
        </div>

        <div className="card-body pt-2">
          {summary.data?.sync.latestImportBatch ? (
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-4">
                <thead>
                  <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                    <th>File</th>
                    <th>Status</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Valid</th>
                    <th className="text-end">Invalid</th>
                    <th className="text-end">Imported</th>
                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody className="fw-semibold text-gray-700">
                  <tr>
                    <td>
                      <div className="fw-bold text-gray-900">
                        {summary.data.sync.latestImportBatch.fileName}
                      </div>
                      <div className="fs-8 text-gray-500">
                        {summary.data.sync.latestImportBatch.batchCode}
                      </div>
                    </td>

                    <td>
                      <ImportStatusBadge
                        status={summary.data.sync.latestImportBatch.status}
                      />
                    </td>

                    <td className="text-end">
                      {formatNumber(summary.data.sync.latestImportBatch.totalRows)}
                    </td>

                    <td className="text-end text-success">
                      {formatNumber(summary.data.sync.latestImportBatch.validRows)}
                    </td>

                    <td className="text-end text-warning">
                      {formatNumber(
                        summary.data.sync.latestImportBatch.invalidRows,
                      )}
                    </td>

                    <td className="text-end text-primary">
                      {formatNumber(
                        summary.data.sync.latestImportBatch.importedRows,
                      )}
                    </td>

                    <td className="fs-8 text-gray-500">
                      {formatDate(summary.data.sync.latestImportBatch.updatedAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded border border-gray-300 border-dashed px-5 py-10 text-center">
              <div className="fw-bold text-gray-900 fs-5 mb-1">
                Belum ada batch import
              </div>
              <div className="text-gray-600 fs-7">
                Batch import terakhir belum tersedia.
              </div>
            </div>
          )}
        </div>
      </div>

      {summary.isLoading || status.isLoading ? (
        <div className="card shadow-sm mt-6">
          <div className="card-body py-4 text-gray-600 fs-7">
            Memuat data integrasi SIASN...
          </div>
        </div>
      ) : null}
    </div>
  )
}
