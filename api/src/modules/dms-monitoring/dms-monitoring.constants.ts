export const DMS_IMPORT_STATUSES = [
  'DRAFT',
  'IMPORTED',
  'PARTIAL',
  'FAILED',
] as const

export type DmsImportStatusValue =
  (typeof DMS_IMPORT_STATUSES)[number]
