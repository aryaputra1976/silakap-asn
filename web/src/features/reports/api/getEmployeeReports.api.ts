import http from "@/core/http/httpClient"
import type {
  EmployeeReportsResponse,
  EmployeeReportSectionKey
} from "../types"

export type EmployeeReportsQuery = {
  unorId?: number
}

function normalizeRows(value: unknown) {
  return Array.isArray(value) ? value : []
}

function normalizeMatrixCell(value: unknown) {
  if (!value || typeof value !== "object") {
    return { pria: 0, wanita: 0, total: 0 }
  }

  const cell = value as Partial<{ pria: number; wanita: number; total: number }>

  return {
    pria: Number(cell.pria ?? 0),
    wanita: Number(cell.wanita ?? 0),
    total: Number(cell.total ?? 0)
  }
}

function normalizeEducationStatusMatrix(payload: Partial<EmployeeReportsResponse> | undefined) {
  const raw = payload?.educationStatusMatrix
  const groups = Array.isArray(raw?.groups) ? raw.groups : []

  return {
    groups: groups.map((group) => ({
      groupKey: String(group?.groupKey ?? ""),
      groupLabel: String(group?.groupLabel ?? ""),
      pegawaiCount: Number(group?.pegawaiCount ?? 0),
      rows: Array.isArray(group?.rows)
        ? group.rows.map((row) => ({
            statusKey:
              row?.statusKey === "pns" ||
              row?.statusKey === "pppk" ||
              row?.statusKey === "pppkParuhWaktu"
                ? row.statusKey
                : "pns",
            statusLabel: String(row?.statusLabel ?? ""),
            pns: normalizeMatrixCell(row?.pns),
            pppk: normalizeMatrixCell(row?.pppk),
            pppkParuhWaktu: normalizeMatrixCell(row?.pppkParuhWaktu),
            total: normalizeMatrixCell(row?.total)
          }))
        : [],
      subtotal: {
        statusKey:
          group?.subtotal?.statusKey === "pns" ||
          group?.subtotal?.statusKey === "pppk" ||
          group?.subtotal?.statusKey === "pppkParuhWaktu"
            ? group.subtotal.statusKey
            : "pns",
        statusLabel: String(group?.subtotal?.statusLabel ?? "Subtotal"),
        pns: normalizeMatrixCell(group?.subtotal?.pns),
        pppk: normalizeMatrixCell(group?.subtotal?.pppk),
        pppkParuhWaktu: normalizeMatrixCell(group?.subtotal?.pppkParuhWaktu),
        total: normalizeMatrixCell(group?.subtotal?.total)
      }
    })),
    grandTotal: {
      statusKey:
        raw?.grandTotal?.statusKey === "pns" ||
        raw?.grandTotal?.statusKey === "pppk" ||
        raw?.grandTotal?.statusKey === "pppkParuhWaktu"
          ? raw.grandTotal.statusKey
          : "pns",
      statusLabel: String(raw?.grandTotal?.statusLabel ?? "Grand Total"),
      pns: normalizeMatrixCell(raw?.grandTotal?.pns),
      pppk: normalizeMatrixCell(raw?.grandTotal?.pppk),
      pppkParuhWaktu: normalizeMatrixCell(raw?.grandTotal?.pppkParuhWaktu),
      total: normalizeMatrixCell(raw?.grandTotal?.total)
    }
  }
}

function normalizeEmployeeReportsResponse(
  payload: Partial<EmployeeReportsResponse> | undefined
): EmployeeReportsResponse {
  return {
    meta: {
      generatedAt: payload?.meta?.generatedAt ?? "",
      generatedAtLabel: payload?.meta?.generatedAtLabel ?? "",
      filterUnorId: payload?.meta?.filterUnorId ?? null,
      filterUnorName: payload?.meta?.filterUnorName ?? null
    },
    educationStatusMatrix: normalizeEducationStatusMatrix(payload),
    genderByEmploymentStatus: normalizeRows(payload?.genderByEmploymentStatus),
    educationByGender: normalizeRows(payload?.educationByGender),
    educationGroupByGender: normalizeRows(payload?.educationGroupByGender),
    golonganByGender: normalizeRows(payload?.golonganByGender),
    golonganRuangByGender: normalizeRows(payload?.golonganRuangByGender),
    jabatanJenjangByGender: normalizeRows(payload?.jabatanJenjangByGender),
    jabatanStrukturalDetail: normalizeRows(payload?.jabatanStrukturalDetail),
    jabatanFungsionalKesehatan: normalizeRows(payload?.jabatanFungsionalKesehatan),
    jabatanFungsionalGuru: normalizeRows(payload?.jabatanFungsionalGuru),
    jabatanFungsionalLainnya: normalizeRows(payload?.jabatanFungsionalLainnya)
  }
}

export async function getEmployeeReports(
  query?: EmployeeReportsQuery
): Promise<EmployeeReportsResponse> {
  const { data } = await http.get<EmployeeReportsResponse>("/statistics/reports/employee", {
    params: query?.unorId ? { unorId: query.unorId } : undefined
  })
  return normalizeEmployeeReportsResponse(data)
}

export async function exportEmployeeReportsExcel(
  section: EmployeeReportSectionKey,
  query?: EmployeeReportsQuery
): Promise<Blob> {
  const { data } = await http.get("/statistics/reports/employee/export", {
    params: {
      format: "excel",
      section,
      ...(query?.unorId ? { unorId: query.unorId } : {})
    },
    responseType: "blob"
  })

  return data
}

export async function exportEmployeeReportsPdf(
  section: EmployeeReportSectionKey,
  query?: EmployeeReportsQuery
): Promise<Blob> {
  const { data } = await http.get("/statistics/reports/employee/export", {
    params: {
      format: "pdf",
      section,
      ...(query?.unorId ? { unorId: query.unorId } : {})
    },
    responseType: "blob"
  })

  return data
}
