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
  EmployeeEducationStatusMatrixGroup,
  EmployeeReportMatrixCell,
  EmployeeReportRow,
  EmployeeReportSectionKey
} from "../types"
import { useUnorOptions } from "@/features/profil-asn/hooks/useUnorOptions"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"
import { useToast } from "@/core/toast/toast.hook"

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

function formatMatrixValue(value: number, useDash = true): string {
  if (useDash && value === 0) {
    return "—"
  }

  return formatNumber(value)
}

function EducationMatrixTable({
  groups
}: {
  groups: EmployeeEducationStatusMatrixGroup[]
}) {
  const grandTotal = groups.reduce(
    (acc, group) => {
      acc.pria += group.subtotal.total.pria
      acc.wanita += group.subtotal.total.wanita
      acc.total += group.subtotal.total.total
      return acc
    },
    { pria: 0, wanita: 0, total: 0 }
  )

  function renderCell(cell: EmployeeReportMatrixCell, allowDash = true) {
    return (
      <>
        <td className="text-end py-3 px-3 whitespace-nowrap min-w-[84px]">{formatMatrixValue(cell.pria, allowDash)}</td>
        <td className="text-end py-3 px-3 whitespace-nowrap min-w-[84px]">{formatMatrixValue(cell.wanita, allowDash)}</td>
        <td className="text-end py-3 px-3 border-end border-gray-100 whitespace-nowrap min-w-[88px]">
          {formatMatrixValue(cell.total, allowDash)}
        </td>
      </>
    )
  }

  return (
    <div className="card border-0 shadow-sm mb-8 overflow-hidden">
      <div
        className="px-6 py-5 d-flex align-items-center justify-content-between flex-wrap gap-4"
        style={{ background: "#243068" }}
      >
        <div className="fw-bolder fs-2 text-white">2. Rekap berdasarkan Pendidikan & Jenis Kelamin</div>
        <div className="badge badge-light-primary fs-5 px-4 py-3">
          {formatNumber(grandTotal.total)} pegawai
        </div>
      </div>

      <div className="card-body p-5 bg-white">
        <div
          className="border border-gray-200 rounded-4 overflow-hidden bg-white"
          style={{ boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)" }}
        >
          <div className="table-responsive" style={{ maxHeight: "70vh" }}>
          <table
            className="table align-middle mb-0"
            style={{
              fontVariantNumeric: "tabular-nums"
            }}
          >
            <thead>
              <tr
                className="fw-bold text-gray-800"
                style={{ background: "#f8fafc" }}
              >
                <th
                  rowSpan={2}
                  className="min-w-200px border-end border-gray-200 align-middle ps-4 py-4 whitespace-nowrap fs-5"
                  style={{
                    width: 320,
                    position: "sticky",
                    left: 0,
                    zIndex: 4,
                    background: "#f8fafc"
                  }}
                >
                  Pendidikan
                </th>
                <th
                  colSpan={3}
                  className="text-center border-end border-gray-200 py-3 min-w-[256px] fs-5"
                  style={{ position: "sticky", top: 0, zIndex: 3, background: "#f8fafc" }}
                >
                  PNS
                </th>
                <th
                  colSpan={3}
                  className="text-center border-end border-gray-200 py-3 min-w-[256px] fs-5"
                  style={{ position: "sticky", top: 0, zIndex: 3, background: "#f8fafc" }}
                >
                  PPPK
                </th>
                <th
                  colSpan={3}
                  className="text-center border-end border-gray-200 py-3 min-w-[256px] fs-5"
                  style={{ position: "sticky", top: 0, zIndex: 3, background: "#f8fafc" }}
                >
                  PPPK Paruh Waktu
                </th>
                <th
                  colSpan={3}
                  className="text-center py-3 min-w-[256px] fs-5"
                  style={{ position: "sticky", top: 0, zIndex: 3, background: "#f3f7ff" }}
                >
                  Total
                </th>
              </tr>
              <tr
                className="fw-semibold text-gray-600 border-bottom border-gray-200"
                style={{ background: "#f8fafc" }}
              >
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>P</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>W</th>
                <th className="text-end border-end border-gray-200 py-2 px-3 whitespace-nowrap min-w-[88px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>Ttl</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>P</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>W</th>
                <th className="text-end border-end border-gray-200 py-2 px-3 whitespace-nowrap min-w-[88px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>Ttl</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>P</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>W</th>
                <th className="text-end border-end border-gray-200 py-2 px-3 whitespace-nowrap min-w-[88px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f8fafc" }}>Ttl</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f3f7ff" }}>P</th>
                <th className="text-end py-2 px-3 whitespace-nowrap min-w-[84px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f3f7ff" }}>W</th>
                <th className="text-end py-2 pe-5 px-3 whitespace-nowrap min-w-[88px] fs-7" style={{ position: "sticky", top: 56, zIndex: 3, background: "#f3f7ff" }}>Ttl</th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <tr
                    key={group.groupKey}
                    className="border-bottom border-gray-100"
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#fcfdff"
                    }}
                  >
                    <td
                      className="fw-semibold text-gray-900 ps-4 py-4 border-end border-gray-100 whitespace-nowrap fs-5"
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        background: index % 2 === 0 ? "#ffffff" : "#fcfdff"
                      }}
                    >
                      {group.groupLabel}
                    </td>
                    {renderCell(group.subtotal.pns)}
                    {renderCell(group.subtotal.pppk)}
                    {renderCell(group.subtotal.pppkParuhWaktu)}
                    <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5" style={{ background: index % 2 === 0 ? "#f8fbff" : "#f3f8ff" }}>
                      {formatMatrixValue(group.subtotal.total.pria, false)}
                    </td>
                    <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5" style={{ background: index % 2 === 0 ? "#f8fbff" : "#f3f8ff" }}>
                      {formatMatrixValue(group.subtotal.total.wanita, false)}
                    </td>
                    <td className="text-end py-4 px-3 pe-5 fw-semibold text-gray-900 whitespace-nowrap min-w-[88px] fs-5" style={{ background: index % 2 === 0 ? "#f8fbff" : "#f3f8ff" }}>
                      {formatMatrixValue(group.subtotal.total.total, false)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-muted">
                    Data pendidikan belum ditemukan dari tabel sumber.
                  </td>
                </tr>
              )}
              {groups.length > 0 ? (
                <tr
                  className="fw-bold border-top border-gray-300"
                  style={{ background: "#f8fafc" }}
                >
                  <td
                    className="ps-4 py-4 text-gray-900 border-end border-gray-200 whitespace-nowrap fs-5"
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      background: "#f8fafc"
                    }}
                  >
                    Grand Total
                  </td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pns.pria, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pns.wanita, 0))}</td>
                  <td className="text-end py-4 px-3 border-end border-gray-200 whitespace-nowrap min-w-[88px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pns.total, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppk.pria, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppk.wanita, 0))}</td>
                  <td className="text-end py-4 px-3 border-end border-gray-200 whitespace-nowrap min-w-[88px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppk.total, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppkParuhWaktu.pria, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppkParuhWaktu.wanita, 0))}</td>
                  <td className="text-end py-4 px-3 border-end border-gray-200 whitespace-nowrap min-w-[88px] fs-5">{formatNumber(groups.reduce((sum, group) => sum + group.subtotal.pppkParuhWaktu.total, 0))}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5" style={{ background: "#f3f7ff" }}>{formatNumber(grandTotal.pria)}</td>
                  <td className="text-end py-4 px-3 whitespace-nowrap min-w-[84px] fs-5" style={{ background: "#f3f7ff" }}>{formatNumber(grandTotal.wanita)}</td>
                  <td className="text-end py-4 px-3 pe-5 whitespace-nowrap min-w-[88px] fs-5" style={{ background: "#f3f7ff" }}>{formatNumber(grandTotal.total)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const SECTION_META: Record<
  EmployeeReportSectionKey,
  { title: string; description: string }
> = {
  "jenis-kelamin": {
    title: "Laporan Jenis Kelamin",
    description:
      "Rekap pegawai berdasarkan status kepegawaian dan komposisi jenis kelamin."
  },
  pendidikan: {
    title: "Laporan Pendidikan",
    description:
      "Rekap pendidikan pegawai berdasarkan tingkat pendidikan dan kelompok besar pendidikan."
  },
  golongan: {
    title: "Laporan Golongan",
    description:
      "Rekap pegawai berdasarkan golongan aktif dan rincian golongan ruang."
  },
  jabatan: {
    title: "Laporan Jabatan",
    description:
      "Rekap jenjang jabatan serta rincian jabatan struktural dan fungsional."
  }
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

function buildEducationMatrixExportHtml(
  title: string,
  filterLabel: string,
  groups: EmployeeEducationStatusMatrixGroup[]
): string {
  const grandTotal = groups.reduce(
    (acc, group) => {
      acc.pns.pria += group.subtotal.pns.pria
      acc.pns.wanita += group.subtotal.pns.wanita
      acc.pns.total += group.subtotal.pns.total
      acc.pppk.pria += group.subtotal.pppk.pria
      acc.pppk.wanita += group.subtotal.pppk.wanita
      acc.pppk.total += group.subtotal.pppk.total
      acc.pppkParuhWaktu.pria += group.subtotal.pppkParuhWaktu.pria
      acc.pppkParuhWaktu.wanita += group.subtotal.pppkParuhWaktu.wanita
      acc.pppkParuhWaktu.total += group.subtotal.pppkParuhWaktu.total
      acc.total.pria += group.subtotal.total.pria
      acc.total.wanita += group.subtotal.total.wanita
      acc.total.total += group.subtotal.total.total
      return acc
    },
    {
      pns: { pria: 0, wanita: 0, total: 0 },
      pppk: { pria: 0, wanita: 0, total: 0 },
      pppkParuhWaktu: { pria: 0, wanita: 0, total: 0 },
      total: { pria: 0, wanita: 0, total: 0 }
    }
  )

  const renderValue = (value: number, useDash = true) =>
    useDash && value === 0 ? "-" : formatNumber(value)

  const rows = groups
    .map(
      (group) => `
        <tr>
          <td>${escapeHtml(group.groupLabel)}</td>
          <td class="num">${renderValue(group.subtotal.pns.pria)}</td>
          <td class="num">${renderValue(group.subtotal.pns.wanita)}</td>
          <td class="num">${renderValue(group.subtotal.pns.total)}</td>
          <td class="num">${renderValue(group.subtotal.pppk.pria)}</td>
          <td class="num">${renderValue(group.subtotal.pppk.wanita)}</td>
          <td class="num">${renderValue(group.subtotal.pppk.total)}</td>
          <td class="num">${renderValue(group.subtotal.pppkParuhWaktu.pria)}</td>
          <td class="num">${renderValue(group.subtotal.pppkParuhWaktu.wanita)}</td>
          <td class="num">${renderValue(group.subtotal.pppkParuhWaktu.total)}</td>
          <td class="num total-col">${renderValue(group.subtotal.total.pria, false)}</td>
          <td class="num total-col">${renderValue(group.subtotal.total.wanita, false)}</td>
          <td class="num total-col">${renderValue(group.subtotal.total.total, false)}</td>
        </tr>
      `
    )
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
        .report-title { background: #243068; color: #fff; padding: 14px 16px; font-size: 20px; font-weight: 700; }
        .table-shell { border: 1px solid #d8e0ef; border-radius: 14px; overflow: hidden; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; }
        thead th { background: #f8fafc; text-align: center; font-weight: 700; }
        th, td { border-bottom: 1px solid #e7edf5; padding: 10px 12px; }
        tbody tr:nth-child(even) td { background: #fcfdff; }
        tbody tr:last-child td { border-bottom: none; }
        td { vertical-align: middle; }
        td:first-child, th:first-child { text-align: left; }
        .num { text-align: right; }
        .total-col { background: #f3f7ff; }
        .grand-total td { font-weight: 700; background: #f8fafc; }
        @media print {
          body { margin: 16px; }
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">Unit aktif: ${escapeHtml(filterLabel)}</div>
      <div class="report-title">2. Rekap berdasarkan Pendidikan & Jenis Kelamin</div>
      <div class="table-shell">
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="min-width:220px">Pendidikan</th>
              <th colspan="3">PNS</th>
              <th colspan="3">PPPK</th>
              <th colspan="3">PPPK Paruh Waktu</th>
              <th colspan="3" style="background:#f3f7ff">Total</th>
            </tr>
            <tr>
              <th>P</th><th>W</th><th>Ttl</th>
              <th>P</th><th>W</th><th>Ttl</th>
              <th>P</th><th>W</th><th>Ttl</th>
              <th style="background:#f3f7ff">P</th><th style="background:#f3f7ff">W</th><th style="background:#f3f7ff">Ttl</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="grand-total">
              <td>Grand Total</td>
              <td class="num">${formatNumber(grandTotal.pns.pria)}</td>
              <td class="num">${formatNumber(grandTotal.pns.wanita)}</td>
              <td class="num">${formatNumber(grandTotal.pns.total)}</td>
              <td class="num">${formatNumber(grandTotal.pppk.pria)}</td>
              <td class="num">${formatNumber(grandTotal.pppk.wanita)}</td>
              <td class="num">${formatNumber(grandTotal.pppk.total)}</td>
              <td class="num">${formatNumber(grandTotal.pppkParuhWaktu.pria)}</td>
              <td class="num">${formatNumber(grandTotal.pppkParuhWaktu.wanita)}</td>
              <td class="num">${formatNumber(grandTotal.pppkParuhWaktu.total)}</td>
              <td class="num total-col">${formatNumber(grandTotal.total.pria)}</td>
              <td class="num total-col">${formatNumber(grandTotal.total.wanita)}</td>
              <td class="num total-col">${formatNumber(grandTotal.total.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <script>
        window.addEventListener('load', function () {
          setTimeout(function () { window.print(); }, 200);
        });
      </script>
    </body>
  </html>`
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
  const toast = useToast()
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
      return []
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
  const sectionMeta = SECTION_META[section]
  const educationMatrixGroups = data?.educationStatusMatrix.groups ?? []
  const totalPegawai =
    section === "pendidikan"
      ? data?.educationStatusMatrix.grandTotal.total.total ?? 0
      : visibleReports.reduce((max, report) => {
          const totalRow = report.rows.find((row) => row.label.toLowerCase() === "total")
          return Math.max(max, totalRow?.total ?? 0)
        }, 0)

  const selectedUnorName = scope.isOperatorScoped
    ? scope.unorName ?? reportMeta?.filterUnorName ?? "Unit operator"
    : unorOptions.find((item) => item.id === String(effectiveUnorId))?.nama ??
      reportMeta?.filterUnorName ??
      "Semua Unit"

  async function handleExportExcel() {
    try {
      setIsExportingExcel(true)
      let blob: Blob
      let fileName = `laporan-pegawai-${section}.xls`

      if (section === "pendidikan") {
        blob = new Blob(
          ["\ufeff", buildEducationMatrixExportHtml("Laporan Pendidikan", selectedUnorName, educationMatrixGroups)],
          { type: "application/vnd.ms-excel;charset=utf-8;" }
        )
      } else {
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
      }

      downloadBlob(blob, fileName)
    } catch (exportError) {
      const message =
        exportError instanceof Error ? exportError.message : "Export Excel gagal"
      toast.error(message)
    } finally {
      setIsExportingExcel(false)
    }
  }

  async function handleExportPdf() {
    try {
      setIsExportingPdf(true)
      const printWindow = window.open("about:blank", "_blank")
      let blob: Blob

      if (section === "pendidikan") {
        blob = new Blob(
          [buildEducationMatrixExportHtml("Laporan Pendidikan", selectedUnorName, educationMatrixGroups)],
          { type: "text/html;charset=utf-8" }
        )
      } else {
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
      }

      if (!printWindow) {
        toast.error("Popup browser diblokir. Izinkan popup untuk export PDF.")
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
      toast.error(message)
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
      <section className="card border-0 shadow-sm overflow-hidden mb-8">
        <div
          className="px-5 px-lg-7 py-5"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-3">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-1">{sectionMeta.title}</div>
              <div className="text-white opacity-75 fs-6" style={{ maxWidth: 820, lineHeight: 1.55 }}>
                {sectionMeta.description}
              </div>
            </div>

            <div
              className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 60,
                height: 60,
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
              }}
            >
              <KTIcon iconName="chart-simple" className="fs-2" />
            </div>
          </div>

          <div className="mb-3">
            <div
              className="rounded-4 px-4 py-3 border border-white border-opacity-25"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <label className="form-label fw-bold text-white fs-4 mb-2">
                Filter Unit Organisasi
              </label>
              <select
                className="form-select form-select-lg"
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
                style={{
                  backgroundColor: "#ffffff",
                  color: "#334e7d",
                  borderRadius: 12,
                  minHeight: 48
                }}
              >
                <option value="">Semua Unit</option>
                {unorOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nama}
                  </option>
                ))}
              </select>
              <div className="fs-7 mt-2" style={{ color: "rgba(255,255,255,0.72)" }}>
                {scope.isOperatorScoped
                  ? "Akun operator dibatasi ke unit organisasi aktif."
                  : "Filter akan diterapkan ke seluruh rekap dan hasil export."}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-stretch gap-3 flex-column flex-xl-row">
            <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25 flex-grow-1">
              <div className="fw-semibold fs-6 mb-2" style={{ lineHeight: 1.5 }}>
                Area ini dipakai untuk membaca rekap operasional berbasis data pegawai aktif
                dan referensi master yang sudah tervalidasi.
              </div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge badge-light-primary">
                  Total Pegawai {formatNumber(totalPegawai)}
                </span>
                <span className="badge badge-light-info">
                  Unit Aktif {selectedUnorName}
                </span>
                <span className="badge badge-light-warning">
                  Dibuat {reportMeta?.generatedAtLabel ?? "-"}
                </span>
              </div>
            </div>

            <div
              className="d-flex flex-column gap-3 align-items-stretch flex-shrink-0"
              style={{ width: 320 }}
            >
              <button
                type="button"
                className="btn fw-semibold fs-4"
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                style={{
                  background: "#e7f0ff",
                  color: "#2f80ed",
                  borderRadius: 12,
                  minHeight: 48
                }}
              >
                {isExportingExcel ? "Mengekspor..." : "Export Excel"}
              </button>
              <button
                type="button"
                className="btn fw-semibold fs-4"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                style={{
                  background: "#2f80ed",
                  color: "#ffffff",
                  borderRadius: 12,
                  minHeight: 48
                }}
              >
                {isExportingPdf ? "Menyiapkan PDF..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {section !== "pendidikan" ? (
        <div className="card mb-8 border border-gray-200 shadow-sm">
          <div className="card-body p-6">
            <div className="row g-5 align-items-end">
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
      ) : null}

      {section === "pendidikan" ? (
        <EducationMatrixTable groups={educationMatrixGroups} />
      ) : (
        visibleReports.map((report) => (
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
        ))
      )}
    </div>
  )
}

