-- =====================================================
-- SILAKAP WORKFLOW MULTI-LEVEL SEED
-- =====================================================
-- Tiga tier layanan:
--   COMPLEX : pensiun, mutasi
--             OPERATOR_OPD → PELAKSANA → ANALIS_PERTAMA
--             → ANALIS_MUDA → ANALIS_MADYA → KEPALA_BADAN
--             → PPPK_PARUH
--   MEDIUM  : kgb, perpindahan-jabatan, kenaikan-jabatan,
--             bebas-hukdis, tugas-belajar
--             OPERATOR_OPD → PELAKSANA → ANALIS_MUDA
--             → KEPALA_BIDANG → PPPK_PARUH
--   SIMPLE  : data-update
--             OPERATOR_OPD → ANALIS_PERTAMA → KEPALA_BIDANG
--             → PPPK_PARUH
-- =====================================================

-- =====================================================
-- TIER COMPLEX: pensiun, mutasi
-- =====================================================
WITH layanan_complex AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('pensiun', 'mutasi')
)
INSERT INTO silakap_workflow_transition (
  jenisLayananId, fromState, actionCode, toState, role, orderNo, createdAt
)
SELECT src.jenisLayananId, src.fromState, src.actionCode, src.toState, src.role, src.orderNo, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'DRAFT'        AS fromState, 'SUBMIT'     AS actionCode, 'SUBMITTED'   AS toState, 'OPERATOR_OPD'   AS role, 1  AS orderNo FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',   'CHECK',      'CHECKED',       'PELAKSANA',       2  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',   'RETURN',     'RETURNED',      'PELAKSANA',       3  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'CHECKED',     'VERIFY',     'VERIFIED',      'ANALIS_PERTAMA',  4  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'CHECKED',     'RETURN',     'RETURNED',      'ANALIS_PERTAMA',  5  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',    'REVIEW',     'REVIEWED',      'ANALIS_MUDA',     6  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',    'RETURN',     'RETURNED',      'ANALIS_MUDA',     7  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'REVIEWED',    'RECOMMEND',  'RECOMMENDED',   'ANALIS_MADYA',    8  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'REVIEWED',    'RETURN',     'RETURNED',      'ANALIS_MADYA',    9  FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'RECOMMENDED', 'APPROVE',    'APPROVED',      'KEPALA_BADAN',    10 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'RECOMMENDED', 'REJECT',     'REJECTED',      'KEPALA_BADAN',    11 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'APPROVED',    'COMPLETE',   'COMPLETED',     'PPPK_PARUH',      12 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',   'SYNC',       'SYNCED_SIASN',  'PPPK_PARUH',      13 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',   'SYNC_FAIL',  'FAILED_SIASN',  'PPPK_PARUH',      14 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'FAILED_SIASN','RESYNC',     'SYNCED_SIASN',  'PPPK_PARUH',      15 FROM layanan_complex lt
  UNION ALL
  SELECT lt.id, 'RETURNED',    'RESUBMIT',   'SUBMITTED',     'OPERATOR_OPD',    16 FROM layanan_complex lt
) src
LEFT JOIN silakap_workflow_transition existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.fromState = src.fromState
 AND existing.actionCode = src.actionCode
WHERE existing.id IS NULL;

-- =====================================================
-- TIER MEDIUM: kgb, perpindahan-jabatan, kenaikan-jabatan,
--              bebas-hukdis, tugas-belajar
-- =====================================================
WITH layanan_medium AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('kgb', 'perpindahan-jabatan', 'kenaikan-jabatan', 'bebas-hukdis', 'tugas-belajar')
)
INSERT INTO silakap_workflow_transition (
  jenisLayananId, fromState, actionCode, toState, role, orderNo, createdAt
)
SELECT src.jenisLayananId, src.fromState, src.actionCode, src.toState, src.role, src.orderNo, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'DRAFT'     AS fromState, 'SUBMIT'    AS actionCode, 'SUBMITTED'  AS toState, 'OPERATOR_OPD'  AS role, 1  AS orderNo FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',  'CHECK',     'CHECKED',      'PELAKSANA',      2  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',  'RETURN',    'RETURNED',     'PELAKSANA',      3  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'CHECKED',    'VERIFY',    'VERIFIED',     'ANALIS_MUDA',    4  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'CHECKED',    'RETURN',    'RETURNED',     'ANALIS_MUDA',    5  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',   'APPROVE',   'APPROVED',     'KEPALA_BIDANG',  6  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',   'RETURN',    'RETURNED',     'KEPALA_BIDANG',  7  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',   'REJECT',    'REJECTED',     'KEPALA_BIDANG',  8  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'APPROVED',   'COMPLETE',  'COMPLETED',    'PPPK_PARUH',     9  FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',  'SYNC',      'SYNCED_SIASN', 'PPPK_PARUH',     10 FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',  'SYNC_FAIL', 'FAILED_SIASN', 'PPPK_PARUH',     11 FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'FAILED_SIASN','RESYNC',   'SYNCED_SIASN', 'PPPK_PARUH',     12 FROM layanan_medium lt
  UNION ALL
  SELECT lt.id, 'RETURNED',   'RESUBMIT',  'SUBMITTED',    'OPERATOR_OPD',   13 FROM layanan_medium lt
) src
LEFT JOIN silakap_workflow_transition existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.fromState = src.fromState
 AND existing.actionCode = src.actionCode
WHERE existing.id IS NULL;

-- =====================================================
-- TIER SIMPLE: data-update
-- =====================================================
WITH layanan_simple AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('data-update')
)
INSERT INTO silakap_workflow_transition (
  jenisLayananId, fromState, actionCode, toState, role, orderNo, createdAt
)
SELECT src.jenisLayananId, src.fromState, src.actionCode, src.toState, src.role, src.orderNo, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'DRAFT'     AS fromState, 'SUBMIT'    AS actionCode, 'SUBMITTED'  AS toState, 'OPERATOR_OPD'   AS role, 1  AS orderNo FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',  'VERIFY',    'VERIFIED',     'ANALIS_PERTAMA', 2  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'SUBMITTED',  'RETURN',    'RETURNED',     'ANALIS_PERTAMA', 3  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',   'APPROVE',   'APPROVED',     'KEPALA_BIDANG',  4  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'VERIFIED',   'REJECT',    'REJECTED',     'KEPALA_BIDANG',  5  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'APPROVED',   'COMPLETE',  'COMPLETED',    'PPPK_PARUH',     6  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',  'SYNC',      'SYNCED_SIASN', 'PPPK_PARUH',     7  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'COMPLETED',  'SYNC_FAIL', 'FAILED_SIASN', 'PPPK_PARUH',     8  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'FAILED_SIASN','RESYNC',   'SYNCED_SIASN', 'PPPK_PARUH',     9  FROM layanan_simple lt
  UNION ALL
  SELECT lt.id, 'RETURNED',   'RESUBMIT',  'SUBMITTED',    'OPERATOR_OPD',   10 FROM layanan_simple lt
) src
LEFT JOIN silakap_workflow_transition existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.fromState = src.fromState
 AND existing.actionCode = src.actionCode
WHERE existing.id IS NULL;

-- =====================================================
-- SLA: COMPLEX (pensiun, mutasi)
-- =====================================================
WITH layanan_complex AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('pensiun', 'mutasi')
)
INSERT INTO silakap_workflow_sla (jenisLayananId, state, durationMinutes, createdAt)
SELECT src.jenisLayananId, src.state, src.durationMinutes, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'SUBMITTED'   AS state, 1440 AS durationMinutes FROM layanan_complex lt
  UNION ALL SELECT lt.id, 'CHECKED',     2880 FROM layanan_complex lt
  UNION ALL SELECT lt.id, 'VERIFIED',    2880 FROM layanan_complex lt
  UNION ALL SELECT lt.id, 'REVIEWED',    1440 FROM layanan_complex lt
  UNION ALL SELECT lt.id, 'RECOMMENDED', 1440 FROM layanan_complex lt
  UNION ALL SELECT lt.id, 'APPROVED',     720 FROM layanan_complex lt
) src
LEFT JOIN silakap_workflow_sla existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.state = src.state
WHERE existing.id IS NULL;

-- =====================================================
-- SLA: MEDIUM
-- =====================================================
WITH layanan_medium AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('kgb', 'perpindahan-jabatan', 'kenaikan-jabatan', 'bebas-hukdis', 'tugas-belajar')
)
INSERT INTO silakap_workflow_sla (jenisLayananId, state, durationMinutes, createdAt)
SELECT src.jenisLayananId, src.state, src.durationMinutes, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'SUBMITTED' AS state, 1440 AS durationMinutes FROM layanan_medium lt
  UNION ALL SELECT lt.id, 'CHECKED',  2880 FROM layanan_medium lt
  UNION ALL SELECT lt.id, 'VERIFIED', 1440 FROM layanan_medium lt
  UNION ALL SELECT lt.id, 'APPROVED',  720 FROM layanan_medium lt
) src
LEFT JOIN silakap_workflow_sla existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.state = src.state
WHERE existing.id IS NULL;

-- =====================================================
-- SLA: SIMPLE (data-update)
-- =====================================================
WITH layanan_simple AS (
  SELECT id FROM silakap_jenis_layanan
  WHERE kode IN ('data-update')
)
INSERT INTO silakap_workflow_sla (jenisLayananId, state, durationMinutes, createdAt)
SELECT src.jenisLayananId, src.state, src.durationMinutes, NOW()
FROM (
  SELECT lt.id AS jenisLayananId, 'SUBMITTED' AS state, 1440 AS durationMinutes FROM layanan_simple lt
  UNION ALL SELECT lt.id, 'VERIFIED', 1440 FROM layanan_simple lt
  UNION ALL SELECT lt.id, 'APPROVED',  720 FROM layanan_simple lt
) src
LEFT JOIN silakap_workflow_sla existing
  ON existing.jenisLayananId = src.jenisLayananId
 AND existing.state = src.state
WHERE existing.id IS NULL;
