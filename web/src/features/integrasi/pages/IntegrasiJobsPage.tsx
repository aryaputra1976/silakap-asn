import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getIntegrasiJobDetail,
  getIntegrasiJobs,
  getIntegrasiJobsSummary,
  runIntegrasiCommitJob,
  runIntegrasiValidateJob,
} from "../api/integrasi.api"
import type { IntegrasiJobItem } from "../types"
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

export default function IntegrasiJobsPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedJob, setSelectedJob] = useState<IntegrasiJobItem | null>(null)

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
    queryKey: ["integrasi", "jobs-summary"],
    queryFn: getIntegrasiJobsSummary,
  })

  const jobs = useQuery({
    queryKey: ["integrasi", "jobs", query],
    queryFn: () => getIntegrasiJobs(query),
  })

  const detail = useQuery({
    queryKey: ["integrasi", "jobs-detail", selectedJob?.id],
    queryFn: () => getIntegrasiJobDetail(selectedJob?.id ?? ""),
    enabled: Boolean(selectedJob),
  })

  const invalidateJobs = async () => {
    await queryClient.invalidateQueries({ queryKey: ["integrasi"] })
  }

  const validateMutation = useMutation({
    mutationFn: runIntegrasiValidateJob,
    onSuccess: invalidateJobs,
  })

  const commitMutation = useMutation({
    mutationFn: runIntegrasiCommitJob,
    onSuccess: invalidateJobs,
  })

  const selectedId = selectedJob?.id
  const availableActions = detail.data?.availableActions ?? []

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
                Job Sinkronisasi
              </div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Kelola job validasi dan commit batch import pegawai dari staging
                agar proses sinkronisasi berjalan terpantau.
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <span className="badge badge-light-primary">Validate Job</span>
                <span className="badge badge-light-success">Commit Job</span>
                <span className="badge badge-light-warning">Error Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Total Job"
            value={summary.data?.totalJobs ?? 0}
            hint="Seluruh job import"
            tone="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Perlu Validasi"
            value={summary.data?.draftJobs ?? 0}
            hint="Status draft"
            tone="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Dengan Error"
            value={summary.data?.errorJobs ?? 0}
            hint="Validasi bermasalah"
            tone="danger"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            label="Imported"
            value={summary.data?.importedJobs ?? 0}
            hint="Selesai commit"
            tone="success"
          />
        </div>
      </div>

      <div className="row g-6">
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <div className="card-title flex-column align-items-start">
                <h3 className="fw-bold text-gray-900 mb-1">Daftar Job</h3>
                <div className="text-gray-600 fs-7">
                  Pilih job untuk melihat detail dan aksi yang tersedia.
                </div>
              </div>

              <div className="card-toolbar">
                <div className="d-flex flex-column flex-md-row gap-3">
                  <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Cari job / file..."
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
                      <th>Job</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Waktu</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="fw-semibold text-gray-700">
                    {jobs.isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">
                          Memuat job...
                        </td>
                      </tr>
                    ) : (jobs.data?.data ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">
                          Belum ada job sinkronisasi.
                        </td>
                      </tr>
                    ) : (
                      (jobs.data?.data ?? []).map((item) => {
                        const isSelected = selectedJob?.id === item.id

                        return (
                          <tr
                            key={item.id}
                            className={isSelected ? "bg-light-primary" : ""}
                          >
                            <td>
                              <div className="fw-bold text-gray-900">
                                {item.name}
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
                              <div className="d-flex align-items-center gap-3">
                                <div className="progress h-8px bg-light flex-grow-1 min-w-100px">
                                  <div
                                    className="progress-bar bg-primary"
                                    role="progressbar"
                                    style={{ width: `${item.progress}%` }}
                                    aria-valuenow={item.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  />
                                </div>
                                <span className="fs-8 text-gray-600">
                                  {item.progress}%
                                </span>
                              </div>
                            </td>

                            <td className="fs-8 text-gray-500">
                              {formatDate(item.updatedAt)}
                            </td>

                            <td className="text-end">
                              <button
                                type="button"
                                onClick={() => setSelectedJob(item)}
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
                <h3 className="fw-bold text-gray-900 mb-1">Detail Job</h3>
                <div className="text-gray-600 fs-7">
                  Detail batch, progress, dan action runner.
                </div>
              </div>

              {detail.data ? (
                <div className="card-toolbar">
                  <ImportStatusBadge status={detail.data.status} />
                </div>
              ) : null}
            </div>

            <div className="card-body pt-2">
              {!selectedJob ? (
                <div className="rounded border border-gray-300 border-dashed px-5 py-10 text-center">
                  <div className="fw-bold text-gray-900 fs-5 mb-1">
                    Pilih job
                  </div>
                  <div className="text-gray-600 fs-7">
                    Klik tombol Detail pada daftar job untuk melihat aksi yang tersedia.
                  </div>
                </div>
              ) : null}

              {selectedJob && detail.isLoading ? (
                <div className="text-gray-500 fs-7">Memuat detail...</div>
              ) : null}

              {selectedJob && detail.data ? (
                <div className="d-flex flex-column gap-5">
                  <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                    <div className="fw-bold text-gray-900 fs-5">
                      {detail.data.name}
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
                        <div className="text-gray-600 fs-8">Total Rows</div>
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

                  <div>
                    <div className="fw-bold text-gray-900 fs-6 mb-3">
                      Available Actions
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={
                          !selectedId ||
                          !availableActions.includes("VALIDATE") ||
                          validateMutation.isPending
                        }
                        onClick={() =>
                          selectedId && validateMutation.mutate(selectedId)
                        }
                        className="btn btn-sm btn-primary"
                      >
                        {validateMutation.isPending
                          ? "Running..."
                          : "Run Validate"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          !selectedId ||
                          !availableActions.includes("COMMIT") ||
                          commitMutation.isPending
                        }
                        onClick={() =>
                          selectedId && commitMutation.mutate(selectedId)
                        }
                        className="btn btn-sm btn-success"
                      >
                        {commitMutation.isPending ? "Running..." : "Run Commit"}
                      </button>
                    </div>
                  </div>

                  {detail.data.errors ? (
                    <div>
                      <div className="fw-bold text-gray-900 fs-6 mb-2">
                        Errors
                      </div>
                      <pre className="mb-0 max-h-250px overflow-auto rounded bg-light-warning px-4 py-3 fs-8 text-warning">
                        {formatError(detail.data.errors)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}