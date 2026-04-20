import type {
  DmsBatchFilters,
  DmsBatchItem,
  DmsBatchListResponse,
  DmsBatchSummaryResponse,
  DmsDashboardFilters,
  DmsDashboardResponse,
  DmsImportResult,
  DmsSnapshotFilters,
  DmsSnapshotListResponse,
} from "../types"

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  return String(value)
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function mapBatchItem(item: Record<string, unknown>): DmsBatchItem {
  return {
    id: String(item.id),
    namaFile: String(item.namaFile ?? ""),
    unorId: toStringOrNull(item.unorId),
    unorNama: toStringOrNull(item.unorNama),
    periodeLabel: toStringOrNull(item.periodeLabel),
    status: String(item.status ?? "DRAFT") as DmsBatchItem["status"],
    totalRows: toNumber(item.totalRows),
    successRows: toNumber(item.successRows),
    failedRows: toNumber(item.failedRows),
    catatan: toStringOrNull(item.catatan),
    importedBy: toStringOrNull(item.importedBy),
    importedByUsername: toStringOrNull(item.importedByUsername),
    importedAt: toStringOrNull(item.importedAt),
    createdAt: String(item.createdAt ?? ""),
    updatedAt: String(item.updatedAt ?? ""),
  }
}

function mapPagination(data: Record<string, unknown>) {
  const pagination = (data.pagination ?? {}) as Record<string, unknown>

  return {
    page: toNumber(pagination.page, 1),
    limit: toNumber(pagination.limit, 10),
    total: toNumber(pagination.total),
    totalPages: toNumber(pagination.totalPages, 1),
  }
}

export function mapDmsBatchListResponse(
  payload: Record<string, unknown>,
): DmsBatchListResponse {
  const rows = Array.isArray(payload.data) ? payload.data : []

  return {
    data: rows.map((item) =>
      mapBatchItem(item as Record<string, unknown>),
    ),
    pagination: mapPagination(payload),
  }
}

export function mapDmsBatchDetailResponse(
  payload: Record<string, unknown>,
): DmsBatchItem {
  return mapBatchItem(payload)
}

export function mapDmsBatchSummaryResponse(
  payload: Record<string, unknown>,
): DmsBatchSummaryResponse {
  const summary = (payload.summary ?? {}) as Record<string, unknown>
  const byKategori = Array.isArray(payload.byKategori)
    ? payload.byKategori
    : []
  const dokumenStats = (payload.dokumenStats ?? {}) as Record<
    string,
    unknown
  >

  return {
    summary: {
      totalAsn: toNumber(summary.totalAsn),
      matchedPegawai: toNumber(summary.matchedPegawai),
      matchedUnor: toNumber(summary.matchedUnor),
      avgSkorArsip: toNumberOrNull(summary.avgSkorArsip),
      latestSync: toStringOrNull(summary.latestSync),
    },
    byKategori: byKategori.map((item) => {
      const row = item as Record<string, unknown>

      return {
        kategori: toStringOrNull(row.kategori),
        total: toNumber(row.total),
      }
    }),
    dokumenStats: {
      drh: toNumber(dokumenStats.drh),
      cpns: toNumber(dokumenStats.cpns),
      d2np: toNumber(dokumenStats.d2np),
      spmt: toNumber(dokumenStats.spmt),
      pns: toNumber(dokumenStats.pns),
    },
  }
}

export function mapDmsSnapshotListResponse(
  payload: Record<string, unknown>,
): DmsSnapshotListResponse {
  const rows = Array.isArray(payload.data) ? payload.data : []

  return {
    data: rows.map((item) => {
      const row = item as Record<string, unknown>

      return {
        id: String(row.id),
        batchId: String(row.batchId),
        pegawaiId: toStringOrNull(row.pegawaiId),
        nip: String(row.nip ?? ""),
        namaSnapshot: String(row.namaSnapshot ?? ""),
        unorId: toStringOrNull(row.unorId),
        unorNama: toStringOrNull(row.unorNama),
        unitKerjaRaw: toStringOrNull(row.unitKerjaRaw),
        drh: Boolean(row.drh),
        cpns: Boolean(row.cpns),
        d2np: Boolean(row.d2np),
        spmt: Boolean(row.spmt),
        pns: Boolean(row.pns),
        skorArsip: toNumberOrNull(row.skorArsip),
        kategoriKelengkapan: toStringOrNull(
          row.kategoriKelengkapan,
        ),
        lastSync: toStringOrNull(row.lastSync),
        isMatchedPegawai: Boolean(row.isMatchedPegawai),
        isMatchedUnor: Boolean(row.isMatchedUnor),
        createdAt: String(row.createdAt ?? ""),
        updatedAt: String(row.updatedAt ?? ""),
      }
    }),
    pagination: mapPagination(payload),
  }
}

export function mapDmsDashboardResponse(
  payload: Record<string, unknown>,
): DmsDashboardResponse {
  const summary = mapDmsBatchSummaryResponse(payload)

  const byUnor = Array.isArray(payload.byUnor) ? payload.byUnor : []

  return {
    ...summary,
    byUnor: byUnor.map((item) => {
      const row = item as Record<string, unknown>

      return {
        unorId: toStringOrNull(row.unorId),
        unorNama: toStringOrNull(row.unorNama),
        totalAsn: toNumber(row.totalAsn),
        avgSkorArsip: toNumberOrNull(row.avgSkorArsip),
        latestSync: toStringOrNull(row.latestSync),
      }
    }),
  }
}

export function mapDmsImportResult(
  payload: Record<string, unknown>,
): DmsImportResult {
  const imported = (payload.imported ?? {}) as Record<string, unknown>
  const errors = Array.isArray(imported.errors) ? imported.errors : []

  return {
    batch: mapDmsBatchDetailResponse(
      payload.batch as Record<string, unknown>,
    ),
    summary: mapDmsBatchSummaryResponse(
      payload.summary as Record<string, unknown>,
    ),
    imported: {
      totalRows: toNumber(imported.totalRows),
      successRows: toNumber(imported.successRows),
      failedRows: toNumber(imported.failedRows),
      status: String(imported.status ?? "FAILED") as DmsImportResult["imported"]["status"],
      errors: errors.map((item) => {
        const row = item as Record<string, unknown>

        return {
          rowNumber: toNumber(row.rowNumber),
          nip: String(row.nip ?? "-"),
          message: String(row.message ?? "Unknown error"),
        }
      }),
    },
  }
}

export function buildDmsBatchQueryParams(
  filters: DmsBatchFilters,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string") {
        return value.trim().length > 0
      }

      return true
    }),
  )
}

export function buildDmsSnapshotQueryParams(
  filters: DmsSnapshotFilters,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string") {
        return value.trim().length > 0
      }

      return true
    }),
  )
}

export function buildDmsDashboardQueryParams(
  filters: DmsDashboardFilters,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string") {
        return value.trim().length > 0
      }

      return true
    }),
  )
}