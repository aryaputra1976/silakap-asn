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
