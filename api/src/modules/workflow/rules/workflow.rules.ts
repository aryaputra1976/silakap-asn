import { LayananStatus } from "@prisma/client"

/**
 * Fallback workflow rules
 * Digunakan jika rule belum tersedia di database
 */
export const WorkflowRules: Record<
  LayananStatus,
  LayananStatus[]
> = {

  DRAFT: [
    LayananStatus.SUBMITTED,
  ],

  SUBMITTED: [
    LayananStatus.CHECKED,
    LayananStatus.VERIFIED,
    LayananStatus.RETURNED,
    LayananStatus.REJECTED,
  ],

  CHECKED: [
    LayananStatus.VERIFIED,
    LayananStatus.RETURNED,
  ],

  VERIFIED: [
    LayananStatus.REVIEWED,
    LayananStatus.APPROVED,
    LayananStatus.RETURNED,
    LayananStatus.REJECTED,
  ],

  REVIEWED: [
    LayananStatus.RECOMMENDED,
    LayananStatus.RETURNED,
  ],

  RECOMMENDED: [
    LayananStatus.APPROVED,
    LayananStatus.REJECTED,
  ],

  RETURNED: [
    LayananStatus.SUBMITTED,
  ],

  APPROVED: [
    LayananStatus.COMPLETED,
    LayananStatus.SYNCED_SIASN,
    LayananStatus.FAILED_SIASN,
  ],

  REJECTED: [],

  COMPLETED: [
    LayananStatus.SYNCED_SIASN,
    LayananStatus.FAILED_SIASN,
  ],

  SYNCED_SIASN: [],

  FAILED_SIASN: [
    LayananStatus.SYNCED_SIASN,
  ],

}