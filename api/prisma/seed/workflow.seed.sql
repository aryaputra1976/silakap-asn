-- =====================================================
-- SILAKAP WORKFLOW BASELINE SEED
-- =====================================================
-- Runtime aktif menggunakan:
-- - silakap_workflow_transition
-- - silakap_workflow_sla
--
-- Model legacy silakap_workflow_template telah dipensiunkan
-- agar tidak ada dua source of truth workflow.
-- =====================================================

WITH layanan_target AS (
  SELECT id, kode
  FROM silakap_jenis_layanan
  WHERE kode IN ('PENSIUN', 'KGB', 'JABATAN', 'MUTASI', 'HUKDIS', 'TUGAS_BELAJAR', 'DATA_UPDATE')
)
INSERT INTO silakap_workflow_transition (
  jenisLayananId,
  fromState,
  actionCode,
  toState,
  role,
  orderNo,
  createdAt
)
SELECT src.jenisLayananId,
       src.fromState,
       src.actionCode,
       src.toState,
       src.role,
       src.orderNo,
       NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'DRAFT' AS fromState, 'SUBMIT' AS actionCode, 'SUBMITTED' AS toState, 'OPERATOR' AS role, 1 AS orderNo
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED', 'VERIFY', 'VERIFIED', 'VERIFIKATOR', 2
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED', 'RETURN', 'RETURNED', 'VERIFIKATOR', 3
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED', 'REJECT', 'REJECTED', 'PPK', 4
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'VERIFIED', 'APPROVE', 'APPROVED', 'PPK', 5
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'VERIFIED', 'RETURN', 'RETURNED', 'VERIFIKATOR', 6
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'RETURNED', 'RESUBMIT', 'SUBMITTED', 'OPERATOR', 7
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'APPROVED', 'SYNC', 'SYNCED_SIASN', 'ADMIN_BKPSDM', 8
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'APPROVED', 'SYNC_FAIL', 'FAILED_SIASN', 'ADMIN_BKPSDM', 9
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'FAILED_SIASN', 'RESYNC', 'SYNCED_SIASN', 'ADMIN_BKPSDM', 10
  FROM layanan_target lt
) src
LEFT JOIN silakap_workflow_transition existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.fromState = src.fromState
 AND existing.actionCode = src.actionCode
WHERE existing.id IS NULL;

WITH layanan_target AS (
  SELECT id, kode
  FROM silakap_jenis_layanan
  WHERE kode IN ('PENSIUN', 'KGB', 'JABATAN', 'MUTASI', 'HUKDIS', 'TUGAS_BELAJAR', 'DATA_UPDATE')
)
INSERT INTO silakap_workflow_sla (
  jenisLayananId,
  state,
  durationMinutes,
  createdAt
)
SELECT src.jenisLayananId,
       src.state,
       src.durationMinutes,
       NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'SUBMITTED' AS state, 1440 AS durationMinutes
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'VERIFIED', 2880
  FROM layanan_target lt
  UNION ALL
  SELECT lt.id, 'APPROVED', 720
  FROM layanan_target lt
) src
LEFT JOIN silakap_workflow_sla existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.state = src.state
WHERE existing.id IS NULL;
