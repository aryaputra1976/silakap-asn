// web/src/features/integrasi/utils/commit-readiness.ts
//
// Sumber kebenaran tunggal untuk commit-readiness.
// Dipakai di: review step (tampilan), tombol commit (disabled), guard handleCommit.
// Pure function — tidak ada side-effect, mudah diuji.

import type {
  BlockingReason,
  CommitReadiness,
  ImportBatchItem,
  MissingReferencesResponse,
} from "../types"

// ─── Label display ────────────────────────────────────────────────────────────

const LABEL: Record<string, string> = {
  invalidRows:     "Baris tidak valid",
  jabatan:         "Jabatan",
  unor:            "Unit Organisasi (UNOR)",
  jenisJabatan:    "Jenis Jabatan",
  pendidikan:      "Pendidikan",
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Hitung CommitReadiness secara deterministik dari data yang sudah ada di cache.
 *
 * Aturan `isReady = false` jika:
 *   1. batch.invalidRows > 0
 *   2. missingJabatan > 0
 *   3. missingUnor > 0
 *   4. missingJenisJabatan > 0
 *
 * pendidikan tidak memblok commit (required: false).
 *
 * @param batch          - detail batch dari API
 * @param missing        - missing references dari API (undefined = belum dimuat)
 * @param missingLoading - true saat query masih loading
 */
export function getCommitReadiness(
  batch: ImportBatchItem,
  missing: MissingReferencesResponse | undefined,
  missingLoading: boolean,
): CommitReadiness {
  const invalidRows       = batch.invalidRows ?? 0
  const missingJabatan    = missing?.jabatan.length ?? 0
  const missingUnor       = missing?.unor.length ?? 0
  const missingPendidikan = missing?.pendidikan.length ?? 0

  // jenisJabatan: baris yang jabatannya ada tapi jenisJabatan-nya null/kosong.
  // Backend menaruh ini di jabatan items dengan name === null sebagai sinyal.
  // Jika belum ada data, anggap 0 — tidak boleh memblok karena data belum pasti.
  const missingJenisJabatan = missing
    ? missing.jabatan.filter((j) => j.name === null).length
    : 0

  const blockingReasons: BlockingReason[] = []

  // ── Required blockers ────────────────────────────────────────────────────

  if (invalidRows > 0) {
    blockingReasons.push({
      key: "invalidRows",
      required: true,
      label: LABEL.invalidRows,
      detail: `${invalidRows} baris gagal validasi. Perbaiki atau hapus baris tersebut sebelum commit.`,
    })
  }

  if (missingJabatan > 0) {
    blockingReasons.push({
      key: "jabatan",
      required: true,
      label: LABEL.jabatan,
      detail: `${missingJabatan} nilai jabatan belum terdaftar di master data.`,
    })
  }

  if (missingUnor > 0) {
    blockingReasons.push({
      key: "unor",
      required: true,
      label: LABEL.unor,
      detail: `${missingUnor} unit organisasi belum terdaftar di master data.`,
    })
  }

  if (missingJenisJabatan > 0) {
    blockingReasons.push({
      key: "jenisJabatan",
      required: true,
      label: LABEL.jenisJabatan,
      detail: `${missingJenisJabatan} jabatan belum memiliki jenis jabatan yang valid.`,
    })
  }

  // ── Optional warnings (tidak memblok) ────────────────────────────────────

  if (missingPendidikan > 0) {
    blockingReasons.push({
      key: "pendidikan",
      required: false,
      label: LABEL.pendidikan,
      detail: `${missingPendidikan} nilai pendidikan belum terdaftar. Data akan diisi default saat commit.`,
    })
  }

  // ── isReady: hanya false jika ada required blocker atau data masih loading ─

  const hasRequiredBlocker = blockingReasons.some((r) => r.required)
  const isReady = !missingLoading && !hasRequiredBlocker

  return {
    isReady,
    invalidRows,
    missingJabatan,
    missingUnor,
    missingJenisJabatan,
    missingPendidikan,
    blockingReasons,
  }
}
