import { useEffect, useMemo, useState } from "react"
import {
  useLocation,
  useSearchParams
} from "react-router-dom"
import { KTIcon } from "@/_metronic/helpers"
import {
  exportEmployeeReportsExcel,
  exportEmployeeReportsPdf
} from "../api/getEmployeeReports.api"
import { useEmployeeReports } from "../hooks/useEmployeeReports"
import type {
  EmployeeReportRow,
  EmployeeReportSectionKey
} from "../types"
import { useUnorOptions } from "@/features/profil-asn/hooks/useUnorOptions"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(url)
}

type VisibleReport = {
  key: string
  title: string
  firstColumnLabel: string
  rows: EmployeeReportRow[]
}

function buildExcelFallbackBlob(
  title: string,
  filterLabel: string,
  reports: VisibleReport[]
): Blob {
  const sections = reports
    .map((report) => {
      const rows =
        report.rows.length > 0
          ? report.rows
              .map(
                (row) => `
                  <tr>
                    <td>${escapeHtml(row.label)}</td>
                    <td>${row.pria}</td>
                    <td>${row.wanita}</td>
                    <td>${row.total}</td>
                  </tr>
                `
              )
              .join("")
          : `
              <tr>
                <td colspan="4">Belum ada data</td>
              </tr>
            `

      return `
        <table border="1" cellspacing="0" cellpadding="6">
          <tr><th colspan="4">${escapeHtml(report.title)}</th></tr>
          <tr>
            <th>${escapeHtml(report.firstColumnLabel)}</th>
            <th>Pria</th>
            <th>Wanita</th>
            <th>Total</th>
          </tr>
          ${rows}
        </table>
        <br />
      `
    })
    .join("")

  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <h2>${escapeHtml(title)}</h2>
        <div>Unit aktif: ${escapeHtml(filterLabel)}</div>
        ${sections}
      </body>
    </html>
  `

  return new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  })
}

function buildPrintableHtml(
  title: string,
  filterLabel: string,
  reports: VisibleReport[]
): string {
  const sections = reports
    .map((report) => {
      const rows =
        report.rows.length > 0
          ? report.rows
              .map(
                (row) => `
                  <tr${row.label.toLowerCase() === "total" ? ' class="is-total"' : ""}>
                    <td>${escapeHtml(row.label)}</td>
                    <td class="num">${formatNumber(row.pria)}</td>
                    <td class="num">${formatNumber(row.wanita)}</td>
                    <td class="num">${formatNumber(row.total)}</td>
                  </tr>
                `
              )
              .join("")
          : `
              <tr>
                <td colspan="4">Belum ada data</td>
              </tr>
            `

      return `
        <section class="report-block">
          <div class="report-title">${escapeHtml(report.title)}</div>
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(report.firstColumnLabel)}</th>
                <th>Pria</th>
                <th>Wanita</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>
      `
    })
    .join("")

  return `<!doctype html>
  <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
        h1 { margin: 0 0 8px; font-size: 28px; }
        .meta { margin-bottom: 18px; color: #475569; font-size: 14px; }
        .report-block { margin-bottom: 24px; page-break-inside: avoid; }
        .report-title { background: #243068; color: #fff; padding: 12px 14px; font-size: 18px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d8e0ef; padding: 10px 12px; }
        th { text-align: left; background: #f8fafc; }
        .num { text-align: right; }
        .is-total td { font-weight: 700; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">Unit aktif: ${escapeHtml(filterLabel)}</div>
      ${sections}
      <script>
        window.addEventListener('load', function () {
          setTimeout(function () { window.print(); }, 200);
        });
      </script>
    </body>
  </html>`
}

type ReportCardProps = {
  title: string
  firstColumnLabel: string
  rows?: EmployeeReportRow[]
  expanded: boolean
  onToggle: () => void
}

function ReportAccordionCard({
  title,
  firstColumnLabel,
  rows,
  expanded,
  onToggle
}: ReportCardProps) {
  const safeRows = Array.isArray(rows) ? rows : []

  return (
    <div className="card border border-gray-200 shadow-sm mb-8 overflow-hidden">
      <button
        type="button"
        className="btn btn-active-color-light border-0 rounded-0 w-100 text-start px-6 py-5 d-flex align-items-center justify-content-between"
        onClick={onToggle}
        style={{
          background: "#243068",
          color: "#ffffff"
        }}
      >
        <span className="fw-bolder fs-2">{title}</span>
        <KTIcon
          iconName={expanded ? "minus-square" : "plus-square"}
          className="fs-1 text-white"
        />
      </button>

      {expanded ? (
        <div className="card-body p-6 bg-white">
          {safeRows.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-rounded border align-middle gs-4 mb-0">
                <thead>
                  <tr className="fw-bold text-gray-800 border-bottom bg-light">
                    <th>{firstColumnLabel}</th>
                    <th className="text-end">Pria</th>
                    <th className="text-end">Wanita</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {safeRows.map((row) => {
                    const isTotal = row.label.toLowerCase() === "total"

                    return (
                      <tr
                        key={`${title}-${row.label}`}
                        className={isTotal ? "fw-bold" : undefined}
                      >
                        <td>{row.label}</td>
                        <td className="text-end">{formatNumber(row.pria)}</td>
                        <td className="text-end">{formatNumber(row.wanita)}</td>
                        <td className="text-end">{formatNumber(row.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-light-warning border border-warning border-dashed mb-0">
              Data untuk laporan ini belum ditemukan dari tabel sumber.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function EmployeeReportsPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { options: unorOptions } = useUnorOptions()
  const scope = useOperatorOpdScope()
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const section: EmployeeReportSectionKey =
    location.pathname.includes("/laporan/pegawai/pendidikan")
      ? "pendidikan"
      : location.pathname.includes("/laporan/pegawai/golongan")
        ? "golongan"
        : location.pathname.includes("/laporan/pegawai/jabatan")
          ? "jabatan"
          : "jenis-kelamin"

  const rawUnorId = searchParams.get("unorId")
  const selectedUnorId = rawUnorId ? Number(rawUnorId) : undefined
  const effectiveUnorId =
    scope.isOperatorScoped && scope.unorId ? scope.unorId : selectedUnorId

  const { data, isLoading, isError, error } = useEmployeeReports({
    unorId: effectiveUnorId
  })

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleReports = useMemo<VisibleReport[]>(() => {
    if (!data) {
      return []
    }

    if (section === "jenis-kelamin") {
      return [
        {
          key: "jenis-kelamin-1",
          title: "1. Rekap Pegawai berdasarkan Jenis Kelamin",
          firstColumnLabel: "Uraian",
          rows: data.genderByEmploymentStatus
        }
      ]
    }

    if (section === "pendidikan") {
      return [
        {
          key: "pendidikan-2",
          title: "2. Rekap Pegawai berdasarkan Pendidikan & Jenis Kelamin",
          firstColumnLabel: "Pendidikan",
          rows: data.educationByGender
        },
        {
          key: "pendidikan-3",
          title: "3. Rekap Pendidikan (Kelompok Besar)",
          firstColumnLabel: "Kategori",
          rows: data.educationGroupByGender
        }
      ]
    }

    if (section === "golongan") {
      return [
        {
          key: "golongan-4",
          title: "4. Rekap Pegawai berdasarkan Golongan",
          firstColumnLabel: "Golongan",
          rows: data.golonganByGender
        },
        {
          key: "golongan-5",
          title: "5. Rekap Pegawai berdasarkan Golongan Ruang (Detail)",
          firstColumnLabel: "Golongan",
          rows: data.golonganRuangByGender
        }
      ]
    }

    return [
      {
        key: "jabatan-6",
        title: "6. Rekap Pegawai berdasarkan Jenjang Jabatan",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanJenjangByGender
      },
      {
        key: "jabatan-7",
        title: "7. Rincian Pegawai Berdasarkan Jabatan Struktural",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanStrukturalDetail
      },
      {
        key: "jabatan-8",
        title: "8. Rincian Pegawai Berdasarkan Jabatan Tenaga Kesehatan",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalKesehatan
      },
      {
        key: "jabatan-9",
        title: "9. Rincian Pegawai Berdasarkan Jabatan Guru",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalGuru
      },
      {
        key: "jabatan-10",
        title: "10. Rincian Pegawai Berdasarkan Jabatan Fungsional Lainnya",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalLainnya
      }
    ]
  }, [data, section])

  useEffect(() => {
    if (scope.isOperatorScoped && scope.unorId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("unorId", String(scope.unorId))
        return next
      }, { replace: true })
    }
  }, [scope.isOperatorScoped, scope.unorId, setSearchParams])

  useEffect(() => {
    if (visibleReports.length === 0) {
      return
    }

    setExpanded((current) => {
      const next = { ...current }
      for (const report of visibleReports) {
        if (!(report.key in next)) {
          next[report.key] = true
        }
      }
      return next
    })
  }, [visibleReports])

  const reportMeta = data?.meta

  const selectedUnorName = scope.isOperatorScoped
    ? scope.unorName ?? reportMeta?.filterUnorName ?? "Unit operator"
    : unorOptions.find((item) => item.id === String(effectiveUnorId))?.nama ??
      reportMeta?.filterUnorName ??
      "Semua Unit"

  async function handleExportExcel() {
    try {
      setIsExportingExcel(true)
      let blob: Blob
      let fileName = `laporan-pegawai-${section}.xlsx`

      try {
        blob = await exportEmployeeReportsExcel(section, {
          unorId: effectiveUnorId
        })
      } catch {
        blob = buildExcelFallbackBlob(
          "Laporan Pegawai",
          selectedUnorName,
          visibleReports
        )
        fileName = `laporan-pegawai-${section}.xls`
      }

      downloadBlob(blob, fileName)
    } catch (exportError) {
      const message =
        exportError instanceof Error ? exportError.message : "Export Excel gagal"
      window.alert(message)
    } finally {
      setIsExportingExcel(false)
    }
  }

  async function handleExportPdf() {
    try {
      setIsExportingPdf(true)
      const printWindow = window.open("about:blank", "_blank")
      let blob: Blob

      try {
        blob = await exportEmployeeReportsPdf(section, {
          unorId: effectiveUnorId
        })
      } catch {
        blob = new Blob(
          [buildPrintableHtml("Laporan Pegawai", selectedUnorName, visibleReports)],
          { type: "text/html;charset=utf-8" }
        )
      }

      if (!printWindow) {
        window.alert("Popup browser diblokir. Izinkan popup untuk export PDF.")
        return
      }

      try {
        printWindow.opener = null
        printWindow.document.title = "Menyiapkan PDF..."
        printWindow.document.body.innerHTML =
          "<div style=\"font-family:Arial,sans-serif;padding:24px\">Menyiapkan preview PDF...</div>"
      } catch {
        // Abaikan jika browser membatasi akses DOM sementara.
      }

      const url = window.URL.createObjectURL(blob)
      printWindow.location.href = url

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 60_000)
    } catch (exportError) {
      const message =
        exportError instanceof Error ? exportError.message : "Export PDF gagal"
      window.alert(message)
    } finally {
      setIsExportingPdf(false)
    }
  }

  if (isLoading || scope.loading) {
    return (
      <div className="container-xxl">
        <div className="card p-10 text-center">Memuat laporan pegawai...</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container-xxl">
        <div className="card p-10 text-danger">
          Gagal memuat laporan pegawai
          {error instanceof Error ? `: ${error.message}` : ""}
        </div>
      </div>
    )
  }

  return (
    <div className="container-xxl">
      <div className="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-6 mb-8">
        <div>
          <h1 className="mb-2">Laporan Pegawai</h1>
          <div className="text-muted fs-6">
            Rekap pegawai berbasis data tabel pegawai dan referensi master aktif.
          </div>
          <div className="text-gray-600 fs-7 mt-3">
            Unit aktif: <span className="fw-bold">{selectedUnorName}</span>
            {" · "}
            Dibuat: {reportMeta?.generatedAtLabel ?? "-"}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-light-primary"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
          >
            {isExportingExcel ? "Mengekspor..." : "Export Excel"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
          >
            {isExportingPdf ? "Menyiapkan PDF..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="card mb-8 border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <div className="row g-5 align-items-end">
            <div className="col-lg-6">
              <label className="form-label fw-bold">Filter Unit Organisasi</label>
              <select
                className="form-select"
                value={effectiveUnorId ? String(effectiveUnorId) : ""}
                disabled={scope.isOperatorScoped}
                onChange={(event) => {
                  const value = event.target.value
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)

                    if (value) {
                      next.set("unorId", value)
                    } else {
                      next.delete("unorId")
                    }

                    return next
                  })
                }}
              >
                <option value="">Semua Unit</option>
                {unorOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nama}
                  </option>
                ))}
              </select>
              <div className="text-muted fs-7 mt-2">
                {scope.isOperatorScoped
                  ? "Akun operator dibatasi ke unit organisasi aktif."
                  : "Filter akan diterapkan ke seluruh rekap dan hasil export."}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex flex-wrap justify-content-lg-end gap-3">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    const next: Record<string, boolean> = {}
                    for (const report of visibleReports) {
                      next[report.key] = true
                    }
                    setExpanded(next)
                  }}
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    const next: Record<string, boolean> = {}
                    for (const report of visibleReports) {
                      next[report.key] = false
                    }
                    setExpanded(next)
                  }}
                >
                  Tutup Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {visibleReports.map((report) => (
        <ReportAccordionCard
          key={report.key}
          title={report.title}
          firstColumnLabel={report.firstColumnLabel}
          rows={report.rows}
          expanded={Boolean(expanded[report.key])}
          onToggle={() =>
            setExpanded((current) => ({
              ...current,
              [report.key]: !current[report.key]
            }))
          }
        />
      ))}
    </div>
  )
}
