import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getIntegrasiLogDetail,
  getIntegrasiLogRows,
  getIntegrasiLogs,
  getIntegrasiLogsSummary,
} from "../api/integrasi.api"
import type { ImportErrorRow, IntegrasiLogItem } from "../types"
import { ImportStatusBadge } from "../components/import/ImportStatusBadge"
import { formatDate, formatNumber } from "../components/import/import-ui"

function SummaryCard({
  label,
  value,
  hint,
  tone = "dark",
}: {
  label: string
  value: number
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
        <div className={`fs-2hx fw-bolder ${toneClass}`}>
          {formatNumber(value)}
        </div>
        <div className="fs-7 text-gray-600 mt-1">{hint}</div>
      </div>
    </div>
  )
}

function formatError(errors: unknown): string {
  if (!errors) return "-"

  if (typeof errors === "string") return errors

  try {
    return JSON.stringify(errors, null, 2)
  } catch {
    return "Error tidak dapat ditampilkan."
  }
}

export default function IntegrasiLogsPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedLog, setSelectedLog] = useState<IntegrasiLogItem | null>(null)

  const query = useMemo(
    () => ({
      page: 1,
      limit: 20,
      q: q.trim() || undefined,
      status: status || undefined,
    }),
    [q, status],
  )

  const summary = useQuery({
    queryKey: ["integrasi", "logs-summary"],
    queryFn: getIntegrasiLogsSummary,
  })

  const logs = useQuery({
    queryKey: ["integrasi", "logs", query],
    queryFn: () => getIntegrasiLogs(query),
  })

  const detail = useQuery({
    queryKey: ["integrasi", "logs-detail", selectedLog?.id],
    queryFn: () => getIntegrasiLogDetail(selectedLog?.id ?? ""),
    enabled: Boolean(selectedLog),
  })

  const rows = useQuery({
    queryKey: ["integrasi", "logs-detail-rows", selectedLog?.id],
    queryFn: () =>
      getIntegrasiLogRows(selectedLog?.id ?? "", {
        page: 1,
        limit: 25,
        rowStatus: "ALL",
      }),
    enabled: Boolean(selectedLog),
  })

  const selectedRows = rows.data?.data ?? []

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
            <div>
              <div className="text-white fw-bolder fs-2 mb-2">
                Riwayat Sinkronisasi
              </div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Pantau riwayat import staging, validasi, error, dan commit data
                pegawai dari modul Integrasi Eksternal.
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <span className="badge badge-light-primary">Import Log</span>
                <span className="badge badge-light-warning">Error Tracking</span>
                <span className="badge badge-light-success">Commit History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Total Batch"
            value={summary.data?.totalBatches ?? 0}
            hint="Seluruh batch import"
            tone="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Batch Error"
            value={summary.data?.errorBatches ?? 0}
            hint="Butuh perbaikan"
            tone="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Rows Valid"
            value={summary.data?.validRows ?? 0}
            hint="Data siap commit"
            tone="success"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Rows Imported"
            value={summary.data?.importedRows ?? 0}
            hint="Sudah masuk master"
            tone="dark"
          />
        </div>
      </div>

      <div className="row g-6">
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <div className="card-title flex-column align-items-start">
                <h3 className="fw-bold text-gray-900 mb-1">
                  Daftar Riwayat
                </h3>
                <div className="text-gray-600 fs-7">
                  Pilih log untuk melihat detail batch dan sample rows.
                </div>
              </div>

              <div className="card-toolbar">
                <div className="d-flex flex-column flex-md-row gap-3">
                  <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Cari batch / file..."
                    className="form-control form-control-sm w-200px"
                  />

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="form-select form-select-sm w-200px"
                  >
                    <option value="">Semua Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="VALIDATED">Tervalidasi</option>
                    <option value="VALIDATED_WITH_ERROR">Validasi Error</option>
                    <option value="IMPORTED">Sudah Diimport</option>
                    <option value="FAILED">Gagal</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body pt-2">
              <div className="table-responsive">
                <table className="table align-middle table-row-dashed fs-6 gy-4">
                  <thead>
                    <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                      <th>Riwayat</th>
                      <th>Status</th>
                      <th>Ringkasan</th>
                      <th>Waktu</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="fw-semibold text-gray-700">
                    {logs.isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10 text-gray-500"
                        >
                          Memuat riwayat...
                        </td>
                      </tr>
                    ) : (logs.data?.data ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10 text-gray-500"
                        >
                          Belum ada riwayat sinkronisasi.
                        </td>
                      </tr>
                    ) : (
                      (logs.data?.data ?? []).map((item) => {
                        const isSelected = selectedLog?.id === item.id

                        return (
                          <tr
                            key={item.id}
                            className={isSelected ? "bg-light-primary" : ""}
                          >
                            <td>
                              <div className="fw-bold text-gray-900">
                                {item.title}
                              </div>
                              <div className="fs-8 text-gray-500">
                                {item.batchCode}
                              </div>
                              <div className="fs-8 text-gray-500">
                                {item.fileName}
                              </div>
                            </td>

                            <td>
                              <ImportStatusBadge status={item.status} />
                            </td>

                            <td>
                              <div>Total: {formatNumber(item.totalRows)}</div>
                              <div className="fs-8 text-success">
                                Valid: {formatNumber(item.validRows)}
                              </div>
                              <div className="fs-8 text-warning">
                                Invalid: {formatNumber(item.invalidRows)}
                              </div>
                              <div className="fs-8 text-primary">
                                Imported: {formatNumber(item.importedRows)}
                              </div>
                            </td>

                            <td className="fs-8 text-gray-500">
                              {formatDate(item.updatedAt)}
                            </td>

                            <td className="text-end">
                              <button
                                type="button"
                                onClick={() => setSelectedLog(item)}
                                className={
                                  isSelected
                                    ? "btn btn-sm btn-primary"
                                    : "btn btn-sm btn-light-primary"
                                }
                              >
                                {isSelected ? "Aktif" : "Detail"}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <div className="card-title flex-column align-items-start">
                <h3 className="fw-bold text-gray-900 mb-1">
                  Detail Riwayat
                </h3>
                <div className="text-gray-600 fs-7">
                  Detail batch, error, dan sample rows.
                </div>
              </div>

              {detail.data ? (
                <div className="card-toolbar">
                  <ImportStatusBadge status={detail.data.status} />
                </div>
              ) : null}
            </div>

            <div className="card-body pt-2">
              {!selectedLog ? (
                <div className="rounded border border-gray-300 border-dashed px-5 py-10 text-center">
                  <div className="fw-bold text-gray-900 fs-5 mb-1">
                    Pilih riwayat
                  </div>
                  <div className="text-gray-600 fs-7">
                    Klik tombol Detail pada daftar riwayat untuk melihat data.
                  </div>
                </div>
              ) : null}

              {selectedLog && detail.isLoading ? (
                <div className="text-gray-500 fs-7">Memuat detail...</div>
              ) : null}

              {selectedLog && detail.data ? (
                <div className="d-flex flex-column gap-5">
                  <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                    <div className="fw-bold text-gray-900 fs-5">
                      {detail.data.title}
                    </div>
                    <div className="text-gray-600 fs-7 mt-1">
                      {detail.data.batchCode}
                    </div>
                    <div className="text-gray-500 fs-8 mt-1">
                      {detail.data.fileName}
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-6">
                      <div className="rounded bg-light px-4 py-4">
                        <div className="fw-bolder fs-2 text-gray-900">
                          {formatNumber(detail.data.totalRows)}
                        </div>
                        <div className="text-gray-600 fs-8">Total</div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="rounded bg-light px-4 py-4">
                        <div className="fw-bolder fs-2 text-success">
                          {formatNumber(detail.data.importedRows)}
                        </div>
                        <div className="text-gray-600 fs-8">Imported</div>
                      </div>
                    </div>
                  </div>

                  {detail.data.errors ? (
                    <div>
                      <div className="fw-bold text-gray-900 fs-6 mb-2">
                        Batch Errors
                      </div>
                      <pre className="mb-0 max-h-150px overflow-auto rounded bg-light-warning px-4 py-3 fs-8 text-warning">
                        {formatError(detail.data.errors)}
                      </pre>
                    </div>
                  ) : null}

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="fw-bold text-gray-900 fs-6">
                        Sample Rows
                      </div>
                      <span className="badge badge-light-dark">
                        {formatNumber(selectedRows.length)} rows
                      </span>
                    </div>

                    <div className="mh-400px overflow-auto d-flex flex-column gap-3 pe-2">
                      {rows.isLoading ? (
                        <div className="text-gray-500 fs-7">
                          Memuat rows...
                        </div>
                      ) : selectedRows.length === 0 ? (
                        <div className="rounded bg-light px-4 py-4 text-gray-500 fs-7">
                          Tidak ada rows.
                        </div>
                      ) : (
                        selectedRows.map((row: ImportErrorRow) => (
                          <div
                            key={row.id}
                            className="rounded border border-gray-200 bg-white px-4 py-3"
                          >
                            <div className="fw-bold text-gray-900 fs-7">
                              Row {formatNumber(row.rowNumber)} —{" "}
                              {row.nama ?? "-"}
                            </div>
                            <div className="text-gray-600 fs-8 mt-1">
                              NIP: {row.nip ?? "-"} · Imported:{" "}
                              {row.isImported ? "Ya" : "Tidak"}
                            </div>

                            {row.errors ? (
                              <pre className="mt-3 mb-0 whitespace-pre-wrap rounded bg-light-warning px-3 py-2 fs-8 text-warning">
                                {formatError(row.errors)}
                              </pre>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}