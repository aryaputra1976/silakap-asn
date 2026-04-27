import type {
  BlockingReason,
  CommitReadiness,
  ImportBatchItem,
  MissingReferencesResponse,
} from "../types"

export function getCommitReadiness(
  batch: ImportBatchItem,
  missing: MissingReferencesResponse | undefined,
  missingLoading: boolean,
): CommitReadiness {
  if (missingLoading) {
    return {
      isReady: false,
      invalidRows: batch.invalidRows,
      missingJabatan: 0,
      missingUnor: 0,
      missingPendidikan: 0,
      blockingReasons: [],
    }
  }

  const missingJabatan = missing?.jabatan.length ?? 0
  const missingUnor = missing?.unor.length ?? 0
  const missingPendidikan = missing?.pendidikan.length ?? 0
  const blockingReasons: BlockingReason[] = []

  if (batch.status.toUpperCase() !== "VALIDATED") {
    blockingReasons.push({
      key: "status",
      label: "Status batch bukan VALIDATED",
      detail: "Validasi batch terlebih dahulu.",
    })
  }
  if (batch.invalidRows > 0) {
    blockingReasons.push({
      key: "invalid-rows",
      label: `${batch.invalidRows} baris gagal validasi`,
      detail: "Perbaiki data pada tab Validasi atau jalankan validasi ulang.",
    })
  }
  if (missingJabatan > 0) {
    blockingReasons.push({
      key: "missing-jabatan",
      label: `${missingJabatan} jabatan belum ada di master`,
      detail: "Import referensi jabatan via halaman Import Referensi.",
    })
  }
  if (missingUnor > 0) {
    blockingReasons.push({
      key: "missing-unor",
      label: `${missingUnor} UNOR belum ada di master`,
      detail: "Import referensi UNOR via halaman Import Referensi.",
    })
  }

  return {
    isReady: blockingReasons.length === 0,
    invalidRows: batch.invalidRows,
    missingJabatan,
    missingUnor,
    missingPendidikan,
    blockingReasons,
  }
}
